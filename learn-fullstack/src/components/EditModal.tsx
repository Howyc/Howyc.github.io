import { useState, useEffect, useMemo } from 'react';
import type { User, Post } from '../types';
import { IconX } from '../assets/icons';

/**
 * 校验错误类型：字段名 -> 中文错误信息
 */
export interface ValidationErrors {
  [field: string]: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 用户表单校验
 */
export function validateUser(data: Record<string, string | number>): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = String(data.name ?? '');
  const username = String(data.username ?? '');
  const email = String(data.email ?? '');
  const phone = String(data.phone ?? '');

  if (name.length < 1 || name.length > 50) {
    errors.name = '姓名长度需在 1-50 个字符之间';
  }
  if (username.length < 1 || username.length > 30) {
    errors.username = '用户名长度需在 1-30 个字符之间';
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = '邮箱格式不正确';
  }
  if (phone.length > 0 && phone.length > 30) {
    errors.phone = '电话长度不能超过 30 个字符';
  }

  return errors;
}

/**
 * 帖子表单校验
 */
export function validatePost(data: Record<string, string | number>): ValidationErrors {
  const errors: ValidationErrors = {};
  const title = String(data.title ?? '');
  const body = String(data.body ?? '');

  if (title.length < 1 || title.length > 200) {
    errors.title = '标题长度需在 1-200 个字符之间';
  }
  if (body.length < 1 || body.length > 2000) {
    errors.body = '内容长度需在 1-2000 个字符之间';
  }

  return errors;
}

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

  const errors = useMemo(() => {
    return type === 'user' ? validateUser(formData) : validatePost(formData);
  }, [formData, type]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = type === 'user' ? validateUser(formData) : validatePost(formData);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
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
                {errors.name && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>用户名</label>
                <input value={formData.username || ''} onChange={e => handleChange('username', e.target.value)} required />
                {errors.username && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} required />
                {errors.email && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>电话</label>
                <input value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                {errors.phone && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.phone}</span>}
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
                {errors.title && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
              </div>
              <div className="form-group">
                <label>内容</label>
                <textarea value={formData.body || ''} onChange={e => handleChange('body', e.target.value)} rows={4} required />
                {errors.body && <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>{errors.body}</span>}
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>取消</button>
            <button type="submit" className="btn-save" disabled={hasErrors}>保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
