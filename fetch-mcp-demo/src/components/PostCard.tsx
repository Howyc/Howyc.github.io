import type { Post } from '../types';
import { IconPencil, IconTrash } from '../assets/icons';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="post-card-header">
        <span className="post-id">#{post.id}</span>
        <span className="post-user">用户 {post.userId}</span>
        <div className="post-actions">
          <button
            className="btn-edit"
            onClick={() => onEdit(post)}
            aria-label="编辑帖子"
          >
            <IconPencil size={16} />
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(post.id)}
            aria-label="删除帖子"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
      <h4 className="post-title">{post.title}</h4>
      <p className="post-body">{post.body}</p>
    </div>
  );
}
