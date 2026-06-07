import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

export const getApplications = () => API.get('/applications')
export const createApplication = (data) => API.post('/applications', data)
export const updateApplication = (id, data) => API.put(`/applications/${id}`, data)
export const deleteApplication = (id) => API.delete(`/applications/${id}`)