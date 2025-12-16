import axios from 'axios'

const API_URL = 'http://localhost:5050/api/therapist'

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('mhj_auth') ? JSON.parse(localStorage.getItem('mhj_auth')).token : null
    return { Authorization: `Bearer ${token}` }
}

export const getTherapistList = async () => {
    const res = await axios.get(`${API_URL}/list`, { headers: getAuthHeaders() })
    return res.data
}

export const selectTherapist = async (therapistId) => {
    const res = await axios.post(`${API_URL}/select`, { therapistId }, { headers: getAuthHeaders() })
    return res.data
}

export const getMyPatients = async () => {
    const res = await axios.get(`${API_URL}/patients`, { headers: getAuthHeaders() })
    return res.data
}

export const getPatientMoodTrend = async (patientId) => {
    const res = await axios.get(`${API_URL}/patient/${patientId}/mood-trend`, { headers: getAuthHeaders() })
    return res.data
}

export const getMyTherapist = async () => {
    const res = await axios.get(`${API_URL}/my-therapist`, { headers: getAuthHeaders() })
    return res.data
}

export const disconnectTherapist = async () => {
    const res = await axios.post(`${API_URL}/disconnect`, {}, { headers: getAuthHeaders() })
    return res.data
}
