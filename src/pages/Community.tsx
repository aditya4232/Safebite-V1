
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share2, Award, Plus, Send } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Post {
  id: number;
  author: {
    name: string;
    avatar?: string;
    level: number;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  postId: number;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: 'Sarah Johnson',
      level: 4,
    },
    content: 'Just discovered that my favorite snack contains high fructose corn syrup! 😱 Any recommendations for healthier alternatives that still satisfy a sweet tooth?',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    isLiked: false
  },
  {
    id: 2,
    author: {
      name: 'Marcus Lee',
      level: 7,
    },
    content: 'Weekly fitness update: Cut out processed foods completely and already feeling more energetic! SafeBite has been super helpful in finding cleaner alternatives to my usual grocery items.',
    timestamp: '5 hours ago',
    likes: 47,
    comments: 12,
    isLiked: true
  },
  {
    id: 3,
    author: {
      name: 'Elena Rodriguez',
      level: 3,
    },
    content: 'Question for the community: Anyone know which yogurt brands have the least amount of added sugar? The SafeBite scanner has been eye-opening but I'm looking for specific recommendations!',
    timestamp: '1 day ago',
    likes: 18,
    comments: 15,
    isLiked: false
  }
];

const mockComments: Comment[] = [
  {
    id: 1,
    postId: 1,
    author: {
      name: 'David Chen',
    },
    content: 'Try dates with a little bit of almond butter! Natural sugar with some protein and fat to slow absorption.',
    timestamp: '1 hour ago',
    likes: 7,
    isLiked: true
  },
  {
    id: 2,
    postId: 1,
    author: {
      name: 'Olivia Park',
    },
    content: 'Dark chocolate (70%+) with a few berries has been my go-to lately. Much less sugar than milk chocolate!',
    timestamp: '45 minutes ago',
    likes: 5,
    isLiked: false
  }
];

const Community = () => {
  const [currentTab, setCurrentTab] = useState('discussions');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setSelectedPost(null);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: posts.length + 1,
      author: {
        name: 'You',
        level: 2,
      },
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleLikePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
  };

  const handleAddComment = () => {
    if (!newCommentContent.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: comments.length + 1,
      postId: selectedPost.id,
      author: {
        name: 'You',
      },
      content: newCommentContent,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };

    setComments([...comments, newComment]);
    
    // Update post comments count
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));

    setNewCommentContent('');
  };

  const handleLikeComment = (commentId: number) => {
    setComments(prevComments => prevComments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const getPostComments = (postId: number) => {
    return comments.filter(comment => comment.postId === postId);
  };

  const renderLeaderboard = () => {
    const users = [
      { name: 'Alex Morgan', points: 1250, streak: 42, badges: 8 },
      { name: 'Marcus Lee', points: 980, streak: 30, badges: 6 },
      { name: 'Sarah Johnson', points: 875, streak: 21, badges: 5 },
      { name: 'Elena Rodriguez', points: 760, streak: 15, badges: 4 },
      { name: 'David Chen', points: 695, streak: 10, badges: 3 },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-safebite-text">Community Leaders</h2>
        
        <div className="sci-fi-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-safebite-text">Top Contributors</h3>
            <Badge className="bg-safebite-teal text-safebite-dark-blue">This Week</Badge>
          </div>
          
          <div className="space-y-4">
            {users.map((user, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg flex items-center justify-between ${
                  index === 0 ? 'bg-safebite-teal/20 border border-safebite-teal' : 'bg-safebite-card-bg-alt'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-safebite-teal text-safebite-dark-blue' : 'bg-safebite-card-bg text-safebite-text-secondary'
                  } mr-3`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-safebite-text font-medium">{user.name}</div>
                    <div className="text-safebite-text-secondary text-xs">
                      {user.streak} day streak · {user.badges} badges
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-safebite-teal">{user.points}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sci-fi-card">
          <h3 className="text-xl font-semibold text-safebite-text mb-4">Your Progress</h3>
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div className="flex-1 bg-safebite-card-bg-alt p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-safebite-teal mb-2">542</div>
              <div className="text-safebite-text-secondary">Total Points</div>
            </div>
            <div className="flex-1 bg-safebite-card-bg-alt p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-safebite-teal mb-2">8</div>
              <div className="text-safebite-text-secondary">Day Streak</div>
            </div>
            <div className="flex-1 bg-safebite-card-bg-alt p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-safebite-teal mb-2">2</div>
              <div className="text-safebite-text-secondary">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscussions = () => {
    if (selectedPost) {
      const postComments = getPostComments(selectedPost.id);
      
      return (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            className="text-safebite-text-secondary hover:text-safebite-text mb-2"
            onClick={handleBackToFeed}
          >
            ← Back to Feed
          </Button>
          
          <Card className="sci-fi-card">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className="bg-safebite-card-bg-alt text-safebite-teal">
                  {selectedPost.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <div className="font-medium text-safebite-text">{selectedPost.author.name}</div>
                  <Badge className="ml-2 bg-safebite-teal/20 text-safebite-teal border border-safebite-teal">
                    Level {selectedPost.author.level}
                  </Badge>
                  <div className="ml-auto text-safebite-text-secondary text-sm">
                    {selectedPost.timestamp}
                  </div>
                </div>
                <p className="text-safebite-text mb-4">{selectedPost.content}</p>
                <div className="flex space-x-4">
                  <Button 
                    variant="ghost" 
                    className={`${
                      selectedPost.isLiked ? 'text-safebite-teal' : 'text-safebite-text-secondary'
                    } hover:text-safebite-teal`}
                    onClick={() => handleLikePost(selectedPost.id)}
                  >
                    <Heart className={`h-5 w-5 mr-1 ${selectedPost.isLiked ? 'fill-current' : ''}`} />
                    {selectedPost.likes}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-safebite-text-secondary hover:text-safebite-teal"
                  >
                    <MessageSquare className="h-5 w-5 mr-1" />
                    {selectedPost.comments}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-safebite-text-secondary hover:text-safebite-teal"
                  >
                    <Share2 className="h-5 w-5 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="sci-fi-card">
            <h3 className="text-xl font-semibold text-safebite-text mb-4">Comments</h3>
            
            <div className="space-y-4 mb-6">
              {postComments.length === 0 ? (
                <p className="text-safebite-text-secondary text-center py-6">No comments yet. Be the first to comment!</p>
              ) : (
                postComments.map(comment => (
                  <div key={comment.id} className="border-b border-safebite-card-bg-alt pb-4 last:border-0">
                    <div className="flex items-start">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-safebite-card-bg-alt text-safebite-teal text-sm">
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <div className="font-medium text-safebite-text text-sm">{comment.author.name}</div>
                          <div className="ml-auto text-safebite-text-secondary text-xs">
                            {comment.timestamp}
                          </div>
                        </div>
                        <p className="text-safebite-text text-sm mb-2">{comment.content}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${
                            comment.isLiked ? 'text-safebite-teal' : 'text-safebite-text-secondary'
                          } hover:text-safebite-teal text-xs p-0`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="Add a comment..."
                className="sci-fi-input resize-none pr-12"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
              />
              <Button 
                className="absolute right-3 bottom-3 p-2 h-auto bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 rounded-full"
                onClick={handleAddComment}
                disabled={!newCommentContent.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <Card className="sci-fi-card">
          <h3 className="text-xl font-semibold text-safebite-text mb-4">Create Post</h3>
          <Textarea
            placeholder="Share your thoughts, questions, or experiences with the community..."
            className="sci-fi-input resize-none mb-4"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </Card>
        
        <div className="space-y-4">
          {posts.map(post => (
            <Card 
              key={post.id} 
              className="sci-fi-card cursor-pointer hover:border-safebite-teal transition-colors"
              onClick={() => handlePostClick(post)}
            >
              <div className="flex items-start">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-safebite-card-bg-alt text-safebite-teal">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className="font-medium text-safebite-text">{post.author.name}</div>
                    <Badge className="ml-2 bg-safebite-teal/20 text-safebite-teal border border-safebite-teal">
                      Level {post.author.level}
                    </Badge>
                    <div className="ml-auto text-safebite-text-secondary text-sm">
                      {post.timestamp}
                    </div>
                  </div>
                  <p className="text-safebite-text mb-4">{post.content}</p>
                  <div className="flex space-x-4">
                    <Button 
                      variant="ghost" 
                      className={`${
                        post.isLiked ? 'text-safebite-teal' : 'text-safebite-text-secondary'
                      } hover:text-safebite-teal`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post.id);
                      }}
                    >
                      <Heart className={`h-5 w-5 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-safebite-text-secondary hover:text-safebite-teal"
                    >
                      <MessageSquare className="h-5 w-5 mr-1" />
                      {post.comments}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-safebite-text-secondary hover:text-safebite-teal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="h-5 w-5 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Community</h1>
            <p className="text-safebite-text-secondary">Connect with other health-focused individuals, share experiences, and ask questions</p>
          </div>

          <Tabs defaultValue="discussions" value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="discussions" className="data-[state=active]:text-safebite-teal data-[state=active]:bg-safebite-card-bg-alt">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:text-safebite-teal data-[state=active]:bg-safebite-card-bg-alt">
                <Award className="h-4 w-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="discussions">
              {renderDiscussions()}
            </TabsContent>
            
            <TabsContent value="leaderboard">
              {renderLeaderboard()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default Community;
