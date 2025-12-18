import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050'
const API_URL = `${API_BASE}/api/circles`

const getAuthHeaders = () => {
    try {
        const stored = localStorage.getItem('mhj_auth')
        if (!stored) return {}
        const { token } = JSON.parse(stored)
        return { Authorization: `Bearer ${token}` }
    } catch {
        return {}
    }
}

export const getCircles = async () => {
    const res = await axios.get(API_URL, { headers: getAuthHeaders() })
    return res.data
}

export const joinCircle = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/join`, {}, { headers: getAuthHeaders() })
    return res.data
}

export const leaveCircle = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/leave`, {}, { headers: getAuthHeaders() })
    return res.data
}

export const createCircle = async (data) => {
    const res = await axios.post(API_URL, data, { headers: getAuthHeaders() })
    return res.data
}

export const deleteCircle = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() })
    return res.data
}

export const getCircleMembers = async (id) => {
    const res = await axios.get(`${API_URL}/${id}/members`, { headers: getAuthHeaders() })
    return res.data
}

export const banCircleMember = async (circleId, userId) => {
    const res = await axios.delete(`${API_URL}/${circleId}/members/${userId}`, { headers: getAuthHeaders() })
    return res.data
}

export const getCirclePosts = async (id) => {
    const res = await axios.get(`${API_URL}/${id}/posts`, { headers: getAuthHeaders() })
    return res.data
}

export const createPost = async (id, data) => {
    const res = await axios.post(`${API_URL}/${id}/posts`, data, { headers: getAuthHeaders() })
    return res.data
}
