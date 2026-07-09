import axios from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/profile");

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeaders = () => ({
  Authorization:
    `Bearer ${getToken()}`
});

export const getAdminProfile =
  async () => {

    const response =
      await axios.get(
        API_URL,
        {
          headers:
            authHeaders()
        }
      );

    return response.data;

  };

export const updateAdminProfile =
  async (data) => {

    const response =
      await axios.put(
        API_URL,
        data,
        {
          headers: {
            ...authHeaders()
          }
        }
      );

    return response.data;

  };

export const uploadAdminPhoto =
  async (file) => {

    const formData =
      new FormData();

    formData.append(
      "photo",
      file
    );

    const response =
      await axios.put(
        API_URL,
        formData,
        {
          headers: {
            ...authHeaders(),
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

    return response.data;

  };

export const changeAdminPassword =
  async (data) => {

    const response =
      await axios.put(
        `${API_URL}/password`,
        data,
        {
          headers:
            authHeaders()
        }
      );

    return response.data;

  };

