# E-commerce React Project

A full-stack e-commerce application built with React frontend and Node.js backend.

## 🚀 Features

### Frontend (React)
- **User Authentication**: Login/Register with JWT
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders, track order history
- **User Profile**: Manage personal information and addresses
- **Address Management**: Add, edit, delete shipping addresses with Vietnam administrative data
- **Responsive Design**: Mobile-friendly UI

### Backend (Node.js/Express)
- **RESTful API**: Complete CRUD operations
- **Authentication**: JWT-based authentication
- **File Upload**: Image upload for products and avatars
- **Database**: MongoDB with Mongoose ODM
- **Address System**: Vietnam administrative data integration

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS3 with responsive design

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (file upload)

## 📁 Project Structure

```
ecommerce-react/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── data/           # Static data (Vietnam admin data)
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DuongVo01/ecommerce-react.git
   cd ecommerce-react
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm start
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PUT /api/addresses/:id/default` - Set default address

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

## 🌟 Key Features

### Address Management System
- **Vietnam Administrative Data**: Real-time cascading dropdowns for provinces, districts, and wards
- **Address Types**: Support for "Nhà Riêng" (Home) and "Văn Phòng" (Office)
- **Default Address**: Set and manage default shipping address
- **CRUD Operations**: Full create, read, update, delete functionality

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Validation**: Form validation with user feedback
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error messages

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**DuongVo01**
- GitHub: [@DuongVo01](https://github.com/DuongVo01)

## 🙏 Acknowledgments

- Vietnam administrative data integration
- React community for excellent documentation
- Node.js and Express.js communities
