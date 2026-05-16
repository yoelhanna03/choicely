import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginLimiter = new RateLimiterMemory({
  points: 5, // Nombre de tentatives autorisées
  duration: 60, // Par période de 60 secondes
});