import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../context/authContext";

function ProtectedRoute({
  children
}) {

  const { token } = useAuth();

  if (!token) {
    return (
      <Navigate
        to="/login"
      />
    );
  }

  return children;
}

export default ProtectedRoute;