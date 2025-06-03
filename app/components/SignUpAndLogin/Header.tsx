interface HeaderProps {
  isLogin: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLogin }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-sm"></div>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanban AI</h1>
      <p className="text-gray-600">
        {isLogin ? "Login to your account" : "Create your account to get started"}
      </p>
    </div>
  );
};

export default Header;
