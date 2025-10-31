// src/api/ragApi.ts
// 4. απλώς μου κάνει τα axios req σε function
// next → ragchatcontext

import axios from 'axios'

const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL

export const askHybrid = async (query: string) => {
  // This line sends a POST request to: {baseURL}/ask-hybrid
  const res = await axios.post(`${baseURL}/ask-hybrid`, { query })
  return res.data
}

export const askHybridBook1 = async (query: string) => {
  const res = await axios.post(`${baseURL}/ask-hybrid-book1`, { query })
  return res.data
}
