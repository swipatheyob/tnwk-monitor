const bcrypt =
  require("bcryptjs");

const User =
  require("../models/User");

const formatUser =
  (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    photo: user.photo,
    phone: user.phone,
    address: user.address,
    lastLogin: user.lastLogin,
    personnelId: user.personnelId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });

const ensurePersonnelId =
  async (user) => {

    if (!user.personnelId) {
      user.personnelId =
        `ADM-${user._id.toString().slice(-6).toUpperCase()}`;

      await user.save();
    }

    return user;

  };

const getProfile =
  async (
    req,
    res
  ) => {

    try {

      const user =
        await User.findById(
          req.user._id
        ).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User tidak ditemukan"
          });
      }

      await ensurePersonnelId(user);

      res.json(
        formatUser(user)
      );

    } catch (error) {

      res.status(500)
        .json({
          message:
            error.message
        });

    }

  };

const updateProfile =
  async (
    req,
    res
  ) => {

    try {

      const {
        username,
        name,
        email,
        phone,
        address
      } = req.body;

      const profileName =
        username ||
        name;

      const currentUser =
        await User.findById(
          req.user._id
        );

      if (!currentUser) {
        return res
          .status(404)
          .json({
            message:
              "User tidak ditemukan"
          });
      }

      if (!profileName && !req.file) {
        return res
          .status(400)
          .json({
            message:
              "Nama wajib diisi"
          });
      }

      if (!email && !req.file) {
        return res
          .status(400)
          .json({
            message:
              "Email wajib diisi"
          });
      }

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Format email tidak valid"
          });
      }

      if (email) {

        const emailExists =
          await User.findOne({
            email,
            _id: {
              $ne: req.user._id
            }
          });

        if (emailExists) {
          return res
            .status(400)
            .json({
              message:
                "Email sudah digunakan"
            });
        }

      }

      const updateData = {
        username:
          profileName ||
          currentUser.username,
        email:
          email ||
          currentUser.email,
        phone:
          phone !== undefined
            ? phone
            : currentUser.phone,
        address:
          address !== undefined
            ? address
            : currentUser.address
      };

      if (req.file) {
        updateData.photo =
          req.file.filename;
      }

      const user =
        await User.findByIdAndUpdate(
          req.user._id,
          updateData,
          {
            new: true,
            runValidators: true
          }
        ).select("-password");

      res.json({
        message:
          "Profil berhasil diperbarui",
        user:
          formatUser(user)
      });

    } catch (error) {

      res.status(500)
        .json({
          message:
            error.message
        });

    }

  };

const updatePassword =
  async (
    req,
    res
  ) => {

    try {

      const {
        oldPassword,
        currentPassword,
        newPassword,
        confirmPassword
      } = req.body;

      const passwordLama =
        oldPassword ||
        currentPassword;

      if (
        !passwordLama ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "Semua field password wajib diisi"
          });
      }

      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({
            message:
              "Password minimal 8 karakter"
          });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({
            message:
              "Konfirmasi password tidak sama"
          });
      }

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User tidak ditemukan"
          });
      }

      const match =
        await bcrypt.compare(
          passwordLama,
          user.password
        );

      if (!match) {
        return res
          .status(400)
          .json({
            message:
              "Password lama salah"
          });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();

      res.json({
        message:
          "Password berhasil diperbarui"
      });

    } catch (error) {

      res.status(500)
        .json({
          message:
            error.message
        });

    }

  };

module.exports = {
  getProfile,
  updateProfile,
  updatePassword
};
