# 🗄️ MongoDB Setup Guide

## 🚨 **Current Issue**
The backend is failing because MongoDB is not running. Here are your options:

## 🔧 **Option 1: MongoDB Atlas (Recommended - Free Cloud Database)**

### **Step 1: Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier)

### **Step 2: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace the placeholder in `n8n_minimal/config.py`:

```python
MONGODB_URL = "mongodb+srv://your_username:your_password@your_cluster.mongodb.net/lawsa?retryWrites=true&w=majority"
```

### **Step 3: Test Connection**
The backend will automatically use this connection string.

## 🔧 **Option 2: Local MongoDB Installation**

### **Step 1: Download MongoDB**
1. Go to [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Download the Windows version
3. Install with default settings

### **Step 2: Start MongoDB Service**
```bash
# Start MongoDB service
net start MongoDB

# Or run manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### **Step 3: Verify Installation**
```bash
mongod --version
```

## 🔧 **Option 3: Docker MongoDB (Alternative)**

### **Step 1: Install Docker Desktop**
1. Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker

### **Step 2: Run MongoDB Container**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### **Step 3: Verify Container**
```bash
docker ps
```

## 🎯 **Quick Test**

Once MongoDB is running, test the backend:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test registration
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔍 **Troubleshooting**

### **If MongoDB Atlas Connection Fails**
1. Check your network connection
2. Verify the connection string format
3. Ensure your IP is whitelisted in Atlas

### **If Local MongoDB Won't Start**
1. Check if port 27017 is available
2. Run as administrator
3. Check Windows services

### **If Docker MongoDB Fails**
1. Ensure Docker Desktop is running
2. Check container logs: `docker logs mongodb`
3. Restart container: `docker restart mongodb`

## 🎉 **Success Indicators**

- ✅ Backend starts without MongoDB errors
- ✅ Health endpoint returns 200 OK
- ✅ Registration endpoint works
- ✅ Login endpoint works

## 📞 **Need Help?**

If you're still having issues:
1. Try MongoDB Atlas (easiest option)
2. Check the backend logs for specific error messages
3. Verify your network connection

The system will work once MongoDB is properly configured! 🚀
