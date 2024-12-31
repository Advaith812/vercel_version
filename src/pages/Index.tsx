import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Heart, MessageSquare, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 via-purple-600 to-purple-700">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            real messages
            <br />
            real connections
          </h1>
          <p className="text-xl mb-8 text-purple-100">
            Create your anonymous messaging link and start receiving honest messages from friends
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Anonymous Messaging */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-8 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-purple-300 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Anonymous Messages</h3>
            <p className="text-purple-200">
              Receive honest and authentic messages from friends without knowing who sent them
            </p>
          </div>

          {/* Conversation Threading */}
          <div className="bg-gradient-to-br from-pink-900 to-pink-800 p-8 rounded-2xl">
            <Users className="w-12 h-12 text-pink-300 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Private Conversations</h3>
            <p className="text-pink-200">
              Reply to messages and start meaningful conversations while maintaining anonymity
            </p>
          </div>

          {/* Save Important Chats */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-2xl">
            <Heart className="w-12 h-12 text-indigo-300 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Save Special Moments</h3>
            <p className="text-indigo-200">
              Keep your favorite conversations and revisit them whenever you want
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-8 rounded-2xl">
            <Crown className="w-12 h-12 text-orange-300 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Custom Links</h3>
            <p className="text-orange-200">
              Create personalized messaging links that reflect your style
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-t from-purple-800 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join now and create your first anonymous messaging link in seconds
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            Create Your Link
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;