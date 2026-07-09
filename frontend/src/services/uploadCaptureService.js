import axios from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/captures");

const getToken = () =>
  localStorage.getItem(
    "token"
  );

export const uploadCaptureFile =
  async (
    formData
  ) => {

    const response =
      await axios.post(
        API_URL,
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };

