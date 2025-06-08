import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalVideos = await Video.countDocuments({ owner: userId });
  if (totalVideos === null || totalVideos === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total videos");
  }

  const totalSubscribers = await Subscription.countDocuments({ channel: userId });
  if (totalSubscribers === null || totalSubscribers === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total subscribers");
  }

  const videoIds = await Video.find({ owner: userId }).distinct("_id");
  const totalVideoLikes = await Like.countDocuments({ video: { $in: videoIds } });
  if (totalVideoLikes === null || totalVideoLikes === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total likes");
  }

  const tweetIds = await Tweet.find({ owner: userId }).distinct("_id");
  const totalTweetLikes = await Like.countDocuments({ tweet: { $in: tweetIds } });
  if (totalTweetLikes === null || totalTweetLikes === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total tweet likes");
  }

  const commentIds = await Comment.find({ owner: userId }).distinct("_id");
  const totalCommentLikes = await Like.countDocuments({ comment: { $in: commentIds } });
  if (totalCommentLikes === null || totalCommentLikes === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total comment likes");
  }

  const totalViewsAgg = await Video.aggregate([
    { $match: { owner: userId } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  if (totalViewsAgg === null || totalViewsAgg === undefined) {
    throw new ApiError(500, "Something went wrong while displaying total views");
  }

  res.status(200).json(
    new ApiResponse(200, {
      totalVideos,
      totalSubscribers,
      totalVideoLikes,
      totalTweetLikes,
      totalCommentLikes,
      totalViews: totalViewsAgg[0]?.totalViews || 0,
    }, "Channel stats fetched successfully")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this channel");
  }

  res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
