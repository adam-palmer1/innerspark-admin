import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Tag, TagCreate, TagUpdate, TagStatistics } from '../types';

interface TagsProps {}

const Tags: React.FC<TagsProps> = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [statistics, setStatistics] = useState<TagStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    orderBy: 'usageCount' as 'usageCount' | 'name' | 'createdAt'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  const [newTag, setNewTag] = useState<TagCreate>({
    name: '',
    description: '',
    color: '#2563eb'
  });

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getTags({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        orderBy: filterOptions.orderBy
      });
      setTags(response.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalItems: response.total
      }));
    } catch (err: any) {
      console.error('Error fetching tags:', err);
      setError(err.message || 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filterOptions]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await apiService.getTagStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error('Failed to fetch tag statistics:', err);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleCreateTag = async () => {
    try {
      await apiService.createTag(newTag);
      setIsCreateModalOpen(false);
      setNewTag({
        name: '',
        description: '',
        color: '#2563eb'
      });
      fetchTags();
      fetchStatistics();
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    }
  };

  const handleEditTag = async (tagUpdate: TagUpdate) => {
    if (!editingTag) return;
    
    try {
      await apiService.updateTag(editingTag.id?.toString() || '', tagUpdate);
      setIsEditModalOpen(false);
      setEditingTag(null);
      fetchTags();
      fetchStatistics();
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await apiService.deleteTag(tagId);
      fetchTags();
      fetchStatistics();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
    }
  };

  const handleRefreshCounts = async () => {
    try {
      const result = await apiService.refreshTagCounts();
      alert(`Successfully updated ${result.updatedTags} tags`);
      fetchTags();
      fetchStatistics();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh tag counts');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTags();
      return;
    }

    try {
      const results = await apiService.searchTags(searchQuery, 50);
      setTags(results);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: results.length
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to search tags');
    }
  };


  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tag Management</h1>
        
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Tags</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalTags}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Usage</h3>
              <p className="text-2xl font-bold text-blue-600">{statistics.totalUsage}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Unused Tags</h3>
              <p className="text-2xl font-bold text-red-600">{statistics.unusedTags}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Create Tag
            </button>
            <button
              onClick={handleRefreshCounts}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Refresh Counts
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterOptions.orderBy}
            onChange={(e) => setFilterOptions(prev => ({
              ...prev,
              orderBy: e.target.value as any
            }))}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            <option value="usageCount">Sort by Usage</option>
            <option value="name">Sort by Name</option>
            <option value="createdAt">Sort by Created Date</option>
          </select>
        </div>
      </div>

      {/* Tags Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">No tags found</td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tag.color && (
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                      )}
                      <span className="font-medium text-gray-900">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm">{tag.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900">{tag.usageCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingTag(tag);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id?.toString() || '')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total tags)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Create New Tag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateTag}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {isEditModalOpen && editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Tag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={editingTag.name}
                  onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={editingTag.description || ''}
                  onChange={(e) => setEditingTag(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  defaultValue={editingTag.color || '#2563eb'}
                  onChange={(e) => setEditingTag(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleEditTag({
                  name: editingTag.name,
                  description: editingTag.description,
                  color: editingTag.color
                })}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTag(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;