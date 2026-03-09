import { useState, useEffect } from 'react';
import type { User, Post } from '../types';
import { IconX } from '../assets/icons';

interface EditModalProps {
  type: 'user' | 'post';
  data: User | Post | null;
  isNew: boolean;
  onSave: (data: User | Post) => void;
  onClose: () => void;
}

export function EditModal({ type, data, isNew, onSave, onClose }: EditModalProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (data) {
      setFormData(data as unknown as Record<string, string | number>);
    } else if (type === 'user') {
      setFormData({ name: '', username: '', email: '', phone: '', website: '', city: '', company: '' });
    } else {
      setFormData({ userId: 1, title: '', body: '' });
    }
  }, [data, type]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as unknown as User | Post);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isNew ? '新增' : '编辑'}{type === 'user' ? '用户' : '帖子'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <IconX size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {type === 'user' ? (
            <>
              <div className="form-group">
                <label>姓名</label>
                <input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>用户名</label>
                <input value={formData.username || ''} onChange={e => handleChange('username', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>电话</label>
                <input value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>网站</label>
                <input value={formData.website || ''} onChange={e => handleChange('website', e.target.value)} />
              </div>
              <div className="form-group">
                <label>城市</label>
                <input value={formData.city || ''} onChange={e => handleChange('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label>公司</label>
                <input value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>用户ID</label>
                <input type="number" value={formData.userId || ''} onChange={e => handleChange('userId', parseInt(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>标题</label>
                <input value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>内容</label>
                <textarea value={formData.body || ''} onChange={e => handleChange('body', e.target.value)} rows={4} required />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>取消</button>
            <button type="submit" className="btn-save">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
