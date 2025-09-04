import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { UserContext } from "../../UserContext";
import { addressService } from "../../services/addressService";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AddressSelect from "../../components/AddressSelect";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import "./AccountPage.css"; // Optional: Keep for custom overrides

// Schema validation for profile form
const profileSchema = yup.object().shape({
  name: yup.string().required("Tên là bắt buộc"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
  gender: yup.string().required("Giới tính là bắt buộc"),
  birthday: yup.date().required("Ngày sinh là bắt buộc"),
});

// Schema validation for address form
const addressSchema = yup.object().shape({
  name: yup.string().required("Họ và tên là bắt buộc"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
  province: yup.string().required("Tỉnh/Thành phố là bắt buộc"),
  district: yup.string().required("Quận/Huyện là bắt buộc"),
  ward: yup.string().required("Phường/Xã là bắt buộc"),
  detailAddress: yup.string().required("Địa chỉ chi tiết là bắt buộc"),
  addressType: yup.string().required("Loại địa chỉ là bắt buộc"),
  isDefault: yup.boolean(),
});

const AccountPage = () => {
  const [editMode, setEditMode] = useState(false);
  const { user, loginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar?.startsWith("/uploads/")
      ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${user.avatar}`
      : user?.avatar || "/default-avatar.png"
  );
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Profile form
  const defaultValues = {
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthday: user?.birthday ? user.birthday.slice(0, 10) : "",
  };

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [showAddressList, setShowAddressList] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Address form
  const addressDefaultValues = {
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
  };

  const addressFormHook = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      ...addressDefaultValues,
      detailAddress: "",
      addressType: "Nhà Riêng",
      isDefault: false
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (user && user.id) {
      loadAddresses();
    } else {
      setAddresses([]);
    }
  }, [user?.id]);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const addressesData = await addressService.getAddresses();
      setAddresses(addressesData);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      showSnackbar("Lỗi khi tải địa chỉ", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddressSelectChange = (values) => {
    addressFormHook.setValue("province", values.province);
    addressFormHook.setValue("district", values.district);
    addressFormHook.setValue("ward", values.ward);
  };

  const handleAddNewAddress = () => {
    addressFormHook.reset({
      name: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detailAddress: "",
      addressType: "Nhà Riêng",
      isDefault: false,
    });
    setEditingAddressId(null);
    setShowAddressForm(true);
    setShowAddressList(false);
  };

  const handleEditAddress = (address) => {
    addressFormHook.reset(address);
    setEditingAddressId(address._id);
    setShowAddressForm(true);
    setShowAddressList(false);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setShowAddressList(true);
  };

  const handleSaveAddress = async (data) => {
    try {
      setLoading(true);
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, data);
        showSnackbar("Cập nhật địa chỉ thành công!");
      } else {
        await addressService.addAddress(data);
        showSnackbar("Thêm địa chỉ thành công!");
      }
      await loadAddresses();
      setShowAddressForm(false);
      setShowAddressList(true);
    } catch (error) {
      console.error("Address operation failed:", error);
      showSnackbar(error.message || "Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      try {
        setLoading(true);
        await addressService.deleteAddress(addressId);
        await loadAddresses();
        showSnackbar("Xóa địa chỉ thành công!");
      } catch (error) {
        console.error("Delete address failed:", error);
        showSnackbar(error.message || "Có lỗi xảy ra khi xóa địa chỉ.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      await addressService.setDefaultAddress(addressId);
      await loadAddresses();
      showSnackbar("Đã đặt làm địa chỉ mặc định!");
    } catch (error) {
      console.error("Set default address failed:", error);
      showSnackbar(error.message || "Có lỗi xảy ra khi đặt địa chỉ mặc định.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveProfile = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("gender", data.gender);
      formData.append("birthday", data.birthday);
      if (avatar) formData.append("avatar", avatar);

      const updatedUser = await (
        await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/user/${user._id || user.id}`, {
          method: "PUT",
          body: formData,
        })
      ).json();

      if (updatedUser) {
        let avatarUrl = updatedUser.avatar;
        if (avatarUrl && avatarUrl.startsWith("/uploads/")) {
          avatarUrl = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${avatarUrl}`;
        }
        loginUser({ ...updatedUser, avatar: avatarUrl });
        setAvatarPreview(avatarUrl || "/default-avatar.png");
        setEditMode(false);
        showSnackbar("Đã lưu thông tin hồ sơ!");
      }
    } catch (err) {
      showSnackbar("Lưu thất bại! Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
      setAvatar(null);
    }
  };

  if (user === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography ml={2}>Đang tải thông tin tài khoản...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="account-container" display="flex" justifyContent="center">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, textAlign: "center" }}>
          <Typography variant="h5" color="primary">
            Tài khoản của tôi
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Bạn chưa đăng nhập.
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/login" sx={{ mt: 3 }}>
            Đăng nhập
          </Button>
        </Paper>
      </Box>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Box display="flex" gap={4} alignItems="flex-start">
            {!editMode ? (
              <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
                <Typography variant="h5" color="primary">
                  Hồ sơ của tôi
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Quản lý thông tin hồ sơ để bảo mật tài khoản
                </Typography>
                <List disablePadding>
                  <ListItem>
                    <ListItemText primary="Tên đăng nhập" secondary={user.username || "-"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Tên" secondary={user.name || "-"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Email" secondary={user.email || "-"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Số điện thoại" secondary={user.phone || "-"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Giới tính" secondary={user.gender || "-"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Ngày sinh"
                      secondary={user.birthday ? user.birthday.slice(0, 10) : "-"}
                    />
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  sx={{ mt: 2 }}
                >
                  Sửa hồ sơ
                </Button>
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
                <form onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
                  <Typography variant="h5" color="primary">
                    Chỉnh sửa hồ sơ
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText primary="Tên đăng nhập" secondary={user.username || "-"} />
                    </ListItem>
                  </List>
                  <Controller
                    name="name"
                    control={profileForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Tên"
                        fullWidth
                        margin="normal"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                  <List disablePadding>
                    <ListItem>
                      <ListItemText primary="Email" secondary={user.email || "-"} />
                    </ListItem>
                  </List>
                  <Controller
                    name="phone"
                    control={profileForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Số điện thoại"
                        fullWidth
                        margin="normal"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Giới tính</InputLabel>
                    <Controller
                      name="gender"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Select label="Giới tính" error={!!fieldState.error} {...field}>
                          <MenuItem value="">Chọn giới tính</MenuItem>
                          <MenuItem value="Nam">Nam</MenuItem>
                          <MenuItem value="Nữ">Nữ</MenuItem>
                          <MenuItem value="Khác">Khác</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                  <Controller
                    name="birthday"
                    control={profileForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Ngày sinh"
                        type="date"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : null}
                    >
                      {saving ? "Đang lưu..." : "Lưu thông tin"}
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => setEditMode(false)}>
                      Hủy
                    </Button>
                  </Box>
                </form>
              </Paper>
            )}
            <Divider orientation="vertical" flexItem />
            <Paper elevation={3} sx={{ p: 4, minWidth: 240, maxWidth: 280, textAlign: "center" }}>
              <Typography variant="h6" color="primary">
                Ảnh đại diện
              </Typography>
              <Box position="relative" display="inline-block" mt={2}>
                <Avatar src={avatarPreview} sx={{ width: 120, height: 120 }} />
                {editMode && (
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "white" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Chọn ảnh JPG, PNG, tối đa 2MB.
                <br />
                Ảnh đại diện giúp bạn nhận diện tài khoản dễ dàng hơn.
              </Typography>
            </Paper>
          </Box>
        );
      case "address":
        return (
          <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: "100%" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" onClick={() => setShowAddressList((prev) => !prev)} sx={{ cursor: "pointer" }}>
                <Typography variant="h5" color="primary">
                  Địa chỉ của tôi
                </Typography>
              </Box>
              <IconButton onClick={loadAddresses} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <Collapse in={showAddressList && !showAddressForm}>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewAddress}
                  sx={{ mb: 2 }}
                >
                  Thêm địa chỉ mới
                </Button>
                {loading ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : addresses.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
                  </Typography>
                ) : (
                  <List>
                    {addresses.map((addr) => (
                      <ListItem key={addr._id} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">{addr.name}</Typography>
                              <Typography color="primary">{addr.phone}</Typography>
                              <Chip
                                label={addr.addressType}
                                color={addr.addressType === "Nhà Riêng" ? "success" : "warning"}
                                size="small"
                              />
                              {addr.isDefault && <Chip label="Mặc định" color="info" size="small" />}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">{addr.detailAddress}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleEditAddress(addr)}>
                            <EditIcon />
                          </IconButton>
                          {!addr.isDefault && (
                            <IconButton
                              edge="end"
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              disabled={loading}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          <IconButton edge="end" onClick={() => handleDeleteAddress(addr._id)} disabled={loading}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Collapse>
            <Collapse in={showAddressForm}>
              <form onSubmit={addressFormHook.handleSubmit(handleSaveAddress)}>
                <Typography variant="h6" color="primary" mb={2}>
                  {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                </Typography>
                <Controller
                  name="name"
                  control={addressFormHook.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Họ và tên *"
                      fullWidth
                      margin="normal"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={addressFormHook.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Số điện thoại *"
                      fullWidth
                      margin="normal"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />
                <AddressSelect
                  value={{
                    province: addressFormHook.watch("province"),
                    district: addressFormHook.watch("district"),
                    ward: addressFormHook.watch("ward"),
                  }}
                  onChange={handleAddressSelectChange}
                />
                <Controller
                  name="detailAddress"
                  control={addressFormHook.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Địa chỉ chi tiết *"
                      fullWidth
                      margin="normal"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="addressType"
                  control={addressFormHook.control}
                  render={({ field }) => (
                    <ToggleButtonGroup
                      value={field.value}
                      exclusive
                      onChange={(_, value) => field.onChange(value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      <ToggleButton value="Nhà Riêng">Nhà Riêng</ToggleButton>
                      <ToggleButton value="Văn Phòng">Văn Phòng</ToggleButton>
                    </ToggleButtonGroup>
                  )}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="isDefault"
                      control={addressFormHook.control}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={field.value}
                          disabled={
                            !addressFormHook.watch("name") ||
                            !addressFormHook.watch("phone") ||
                            !addressFormHook.watch("province") ||
                            !addressFormHook.watch("district") ||
                            !addressFormHook.watch("ward") ||
                            !addressFormHook.watch("detailAddress")
                          }
                        />
                      )}
                    />
                  }
                  label="Đặt làm địa chỉ mặc định"
                />
                <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button variant="outlined" color="primary" onClick={handleCancelAddressForm}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? "Đang xử lý..." : "Lưu"}
                  </Button>
                </Box>
              </form>
            </Collapse>
          </Paper>
        );
      case "privacy":
        return (
          <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%", textAlign: "center" }}>
            <Typography variant="h5" color="primary">
              Thiết Lập Riêng Tư
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quản lý các thiết lập bảo mật và quyền riêng tư.
            </Typography>
            <Typography color="text.secondary">Chức năng này sẽ được phát triển sau.</Typography>
          </Paper>
        );
      case "info":
        return (
          <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%", textAlign: "center" }}>
            <Typography variant="h5" color="primary">
              Thông tin cá nhân
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Xem thông tin cá nhân của bạn.
            </Typography>
            <Typography color="text.secondary">Chức năng này sẽ được phát triển sau.</Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onNavigateOrders={() => navigate("/my-orders")} />
      <div className="page-main">
        <div className="page-wrapper">
          {renderTabContent()}
        </div>
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AccountPage;