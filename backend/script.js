import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import path from 'path';


const app = express();
const port = 8000;

app.use(cors());
app.use(express.json())
app.use(express.static(path.join(process.cwd(), "..", "frontend", "dist")))

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token invalid' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
};


app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      "secret",
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      "secret",
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = {
      ...req.user.toObject(),
      followersCount: req.user.followers.length,
      followingCount: req.user.following.length
    };
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    const profile = {
      ...updatedUser.toObject(),
      followersCount: updatedUser.followers.length,
      followingCount: updatedUser.following.length
    };

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  app.get('/api/feed', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('following');

      const followingIds = user.following || [];

      const posts = await Post.find({
        user: { $in: [req.user._id, ...followingIds] }
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'username profilePic bio')
        .populate('likes.user', 'username')
        .populate('comments.user', 'username');

      res.json({ success: true, posts });

    } catch (error) {
      console.error('Feed error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

app.get('/api/feed', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({
      user: {
        $in: [req.user._id, ...req.user.following]
      }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'username profilePic bio')
      .populate({
        path: 'likes.user',
        select: 'username'
      })
      .populate({
        path: 'comments.user',
        select: 'username'
      });

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId.toString());

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: userId });
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePic')
      .populate({ path: 'likes.user', select: 'username' })
      .populate({ path: 'comments.user', select: 'username' });

    res.json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/posts/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text required' });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim()
    });
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePic')
      .populate({ path: 'likes.user', select: 'username' })
      .populate({ path: 'comments.user', select: 'username' });

    res.json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/posts/:id/comment/:commentId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId &&
        comment.user.toString() === req.user._id.toString()
    );

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found or not authorized' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePic')
      .populate({ path: 'likes.user', select: 'username' })
      .populate({ path: 'comments.user', select: 'username' });

    res.json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    })
      .select('username profilePic bio followersCount followingCount')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/user/follow/:id', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.json({ success: false });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false });
    }

    const alreadyFollowing = req.user.following.some(f => f.toString() === targetId);

    if (!alreadyFollowing) {
      req.user.following.push(targetId);
      targetUser.followers.push(req.user._id);
      await req.user.save();
      await targetUser.save();
    }

    const updatedSelf = await User.findById(req.user._id)
      .populate('following', 'username profilePic')
      .select('-password');

    const updatedTarget = await User.findById(targetId)
      .populate('followers', 'username profilePic')
      .select('-password');

    res.json({
      success: true,
      profile: {
        ...updatedSelf.toObject(),
        followingCount: updatedSelf.following.length,
        followersCount: updatedSelf.followers.length
      },
      targetProfile: {
        ...updatedTarget.toObject(),
        followingCount: updatedTarget.following.length,
        followersCount: updatedTarget.followers.length
      }
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.put('/api/user/unfollow/:id', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;

    req.user.following = req.user.following.filter(
      f => f.toString() !== targetId
    );

    const targetUser = await User.findById(targetId);

    if (targetUser) {
      targetUser.followers = targetUser.followers.filter(
        f => f.toString() !== req.user._id.toString()
      );
      await targetUser.save();
    }

    await req.user.save();

    const updatedSelf = await User.findById(req.user._id)
      .populate('following', 'username profilePic')
      .select('-password');

    const updatedTarget = targetUser
      ? await User.findById(targetId)
        .populate('followers', 'username profilePic')
        .select('-password')
      : null;

    res.json({
      success: true,
      profile: {
        ...updatedSelf.toObject(),
        followingCount: updatedSelf.following.length,
        followersCount: updatedSelf.followers.length
      },
      targetProfile: updatedTarget
        ? {
          ...updatedTarget.toObject(),
          followingCount: updatedTarget.following.length,
          followersCount: updatedTarget.followers.length
        }
        : null
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), "..", "frontend", "dist", "index.html"));
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();