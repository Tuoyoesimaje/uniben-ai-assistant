export default function ResourceCard({ message }) {
  // Extract resource info from function calls
  const resourceData = message.functionCalls?.find(call =>
    call.name === 'recommendResources'
  )?.response;

  if (!resourceData || (!resourceData.videos?.length && !resourceData.articles?.length)) {
    return null;
  }

  return (
    <div className="flex flex-col w-full max-w-md rounded-xl bg-white overflow-hidden shadow-sm border border-slate-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📚</span>
          <h3 className="text-lg font-bold text-slate-800">
            Learning Resources
          </h3>
        </div>

        {/* Videos */}
        {resourceData.videos?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">🎥 Videos</h4>
            <div className="space-y-2">
              {resourceData.videos.map((video, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {video.source} • {video.rating}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {video.description}
                      </p>
                    </div>
                    <button className="flex-shrink-0 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {resourceData.articles?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">📄 Articles</h4>
            <div className="space-y-2">
              {resourceData.articles.map((article, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {article.source}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {article.description}
                      </p>
                    </div>
                    <button className="flex-shrink-0 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}