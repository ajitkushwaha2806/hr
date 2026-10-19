import axios from "axios";

const api = axios.create({ 
  baseURL: "/", 
  headers: { 
    "Content-Type": "application/json",  
  }, 
  timeout: 1000000, 
}); 

export default api;