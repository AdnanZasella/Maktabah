package com.maktabah.controller;

import com.maktabah.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payment/create-checkout
     * Requires a valid JWT cookie. Returns the Stripe checkout URL.
     */
    @PostMapping("/create-checkout")
    public ResponseEntity<?> createCheckout(
            Authentication authentication,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            String plan = (body != null) ? body.getOrDefault("plan", "monthly") : "monthly";
            String url = paymentService.createCheckoutSession(userId, plan);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            log.error("Failed to create checkout session: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Something went wrong. Please try again."));
        }
    }

    /**
     * POST /api/payment/webhook
     * No auth — Stripe calls this. Signature is verified inside PaymentService.
     * Must use @RequestBody String to preserve raw bytes for signature verification.
     */
    @PostMapping(value = "/webhook", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("OK");
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (Exception e) {
            log.warn("Webhook processing error: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        }
    }
}
