import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Newspaper, Search, Filter, Calendar, User, Tag, ChevronDown, ExternalLink } from 'lucide-react';

const NewsPage = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    loadNews();
  }, [user]);

  useEffect(() => {
    filterAndSortNews();
  }, [news, searchTerm, selectedCategory, sortBy]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.success ? data.news : []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNews = () => {
    let filtered = [...news];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'university':
          filtered = filtered.filter(item => item.audience === 'everyone');
          break;
        case 'department':
          filtered = filtered.filter(item => item.audience === 'department_specific');
          break;
        case 'course':
          filtered = filtered.filter(item => item.audience === 'course_specific');
          break;
        case 'financial':
          filtered = filtered.filter(item =>
            item.audience === 'students_only' ||
            item.audience === 'staff_only' ||
            item.author?.role === 'bursary_admin'
          );
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      // First sort by priority (high first)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      return 0;
    });

    setFilteredNews(filtered);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceLabel = (audience, department, course) => {
    switch (audience) {
      case 'everyone': return 'University-wide';
      case 'students_only': return 'Students';
      case 'staff_only': return 'Staff';
      case 'department_specific': return department ? `Department: ${department.name}` : 'Department';
      case 'course_specific': return course ? `Course: ${course.code}` : 'Course';
      default: return 'General';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="login-card p-8 text-center">
          <h1 className="text-2xl font-bold text-[#111816] mb-4">Access Denied</h1>
          <p className="text-slate-600">Please log in to view news.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-emerald-600" />
              University News & Announcements
            </h1>
            <p className="text-gray-600">
              Stay updated with the latest news from UNIBEN
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="university">University News</option>
                  <option value="department">Department News</option>
                  <option value="course">Course News</option>
                  <option value="financial">Financial Updates</option>
                </select>
              </div>

              {/* Sort */}
              <div className="w-full lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* News List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No news available at the moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">
                        {truncateContent(item.content)}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {item.author?.name} ({item.author?.role?.replace('_', ' ')})
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {getAudienceLabel(item.audience, item.department, item.course)}
                        </div>
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <ExternalLink className="w-4 h-4" />
                            {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex-shrink-0">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedNews.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>By {selectedNews.author?.name}</span>
                  <span>•</span>
                  <span>{formatDate(selectedNews.createdAt)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedNews.priority)}`}>
                    {selectedNews.priority} priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNews.content}</p>
              </div>

              {/* Attachments */}
              {selectedNews.attachments && selectedNews.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedNews.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{attachment.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Audience: {getAudienceLabel(selectedNews.audience, selectedNews.department, selectedNews.course)}
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;