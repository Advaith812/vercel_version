import { MessageCircle, Link2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ConversationHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MessageCircle className="text-purple-600" />
        <div>
          <h1 className="text-xl font-semibold text-purple-600">Conversation</h1>
          <p className="text-sm text-gray-500">Anonymous conversation</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="text-gray-600 hover:text-gray-800"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
          }}
        >
          <Link2 className="h-5 w-5" />
        </button>
        <button 
          className="text-gray-600 hover:text-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};