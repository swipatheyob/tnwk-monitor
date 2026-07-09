import axios
  from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/dashboard");

const getToken =
  () =>
    localStorage.getItem(
      "token"
    );

export const getDashboardStats =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/stats`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };
