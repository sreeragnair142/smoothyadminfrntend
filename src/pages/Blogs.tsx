import React, { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Blog } from '../types';
import { blogs as initialBlogs } from '../data/mockData';

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    author: '',
    imageUrl: '',
    tags: '',
    publishDate: '',
    status: 'draft',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const columns = [
    { 
      header: 'Title', 
      accessor: (blog: Blog) => (
        <div className="flex items-center">
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="h-10 w-10 object-cover rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">{blog.title}</div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(blog.publishDate).toLocaleDateString()}
              <span className="mx-1">•</span>
              <User className="h-3 w-3 mr-1" />
              {blog.author}
            </div>
          </div>
        </div>
      ),
    },
    { 
      header: 'Status', 
      accessor: (blog: Blog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {blog.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
    },
    { 
      header: 'Tags', 
      accessor: (blog: Blog) => (
        <div className="flex flex-wrap gap-1">
          {blog.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      id: '',
      title: '',
      content: '',
      author: '',
      imageUrl: '',
      tags: '',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
    setModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      imageUrl: blog.imageUrl,
      tags: blog.tags.join(', '),
      publishDate: new Date(blog.publishDate).toISOString().split('T')[0],
      status: blog.status,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  const openPreviewModal = (blog: Blog) => {
    setPreviewBlog(blog);
    setPreviewModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const blogData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      publishDate: new Date(formData.publishDate).toISOString(),
    };
    
    if (editingBlog) {
      // Update existing blog
      setBlogs(blogs.map(blog => 
        blog.id === editingBlog.id ? { ...blogData, id: blog.id } as Blog : blog
      ));
    } else {
      // Add new blog
      const newBlog: Blog = {
        ...blogData,
        id: Date.now().toString(),
      } as Blog;
      setBlogs([...blogs, newBlog]);
    }
    
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (blogToDelete) {
      setBlogs(blogs.filter(blog => blog.id !== blogToDelete.id));
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const toggleBlogStatus = (blog: Blog) => {
    setBlogs(blogs.map(b => 
      b.id === blog.id 
        ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } 
        : b
    ));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-gray-600">Create and manage blog content for your smoothie store</p>
      </div>
      
      <DataTable
        columns={columns}
        data={blogs}
        keyField="id"
        title="Blog Posts"
        onAddNew={openAddModal}
        addNewLabel="Create Blog Post"
        searchPlaceholder="Search blog posts..."
        actions={(blog) => (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => openPreviewModal(blog)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Preview"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleBlogStatus(blog)}
              className={`p-1 ${blog.status === 'published' ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
              title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
            >
              {blog.status === 'published' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => openEditModal(blog)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(blog)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      />
      
      {/* Add/Edit Blog Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}
        size="xl"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              {editingBlog ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Blog post title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Author name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Featured Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Preview:</p>
                <div className="mt-1 relative h-32 w-full md:w-1/2 lg:w-1/3 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={formData.imageUrl} 
                    alt="Blog preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder="Write your blog post content here..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="health, nutrition, recipes (comma separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">
                Publish Date
              </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Blog Post"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the blog post "{blogToDelete?.title}"? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Blog Preview"
        size="xl"
      >
        {previewBlog && (
          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img 
                src={previewBlog.imageUrl} 
                alt={previewBlog.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{previewBlog.title}</h1>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-1" />
                <span>{previewBlog.author}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(previewBlog.publishDate).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  previewBlog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {previewBlog.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {previewBlog.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p>{previewBlog.content}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Blogs;