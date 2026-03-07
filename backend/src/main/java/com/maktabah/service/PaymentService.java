package com.maktabah.service;

import com.maktabah.model.User;
import com.maktabah.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final UserRepository userRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    @Value("${stripe.price.id}")
    private String stripePriceId;

    @Value("${app.base.url}")
    private String appBaseUrl;

    public PaymentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Creates a Stripe checkout session in subscription mode for the given user.
     * Returns the session URL to redirect the user to.
     */
    public String createCheckoutSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(user.getEmail())
                    .setSuccessUrl(appBaseUrl + "/#/account?payment=success")
                    .setCancelUrl(appBaseUrl + "/#/account?payment=cancelled")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(stripePriceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Stripe checkout session", e);
        }
    }

    /**
     * Verifies the Stripe webhook signature and processes the event.
     * Throws SignatureVerificationException if the signature is invalid — the
     * controller catches this and returns 400.
     */
    public void handleWebhook(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);

        switch (event.getType()) {

            case "checkout.session.completed" -> {
                var deserializer = event.getDataObjectDeserializer();
                Session session;
                try {
                    session = (Session) deserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.warn("Failed to deserialize checkout.session.completed: {}", e.getMessage());
                    break;
                }

                // Two-step user lookup — email can be null for returning customers
                Optional<User> userOpt = Optional.empty();
                String email = session.getCustomerEmail();
                if (email != null) {
                    userOpt = userRepository.findByEmail(email);
                }
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByStripeCustomerId(session.getCustomer());
                }
                if (userOpt.isEmpty()) {
                    log.warn("No user found for checkout session: {}", session.getId());
                    break;
                }

                User user = userOpt.get();
                user.setSubscriptionStatus("paid");
                user.setStripeCustomerId(session.getCustomer());
                user.setStripeSubscriptionId(session.getSubscription());
                userRepository.save(user);
                log.info("User {} upgraded to paid via checkout session {}", user.getEmail(), session.getId());
            }

            case "customer.subscription.deleted" -> {
                var deserializer = event.getDataObjectDeserializer();
                Subscription subscription;
                try {
                    subscription = (Subscription) deserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.warn("Failed to deserialize customer.subscription.deleted: {}", e.getMessage());
                    break;
                }

                Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscription.getId());
                if (userOpt.isEmpty()) {
                    log.warn("No user found for subscription: {}", subscription.getId());
                    break;
                }

                User user = userOpt.get();
                user.setSubscriptionStatus("free");
                user.setStripeSubscriptionId(null);
                userRepository.save(user);
                log.info("User {} downgraded to free — subscription {} deleted", user.getEmail(), subscription.getId());
            }

            case "invoice.payment_succeeded" -> {
                var deserializer = event.getDataObjectDeserializer();
                Invoice invoice;
                try {
                    invoice = (Invoice) deserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.warn("Failed to deserialize invoice.payment_succeeded: {}", e.getMessage());
                    break;
                }

                Optional<User> userOpt = userRepository.findByStripeCustomerId(invoice.getCustomer());
                if (userOpt.isEmpty()) {
                    log.warn("No user found for customer: {}", invoice.getCustomer());
                    break;
                }

                User user = userOpt.get();
                user.setSubscriptionStatus("paid");
                userRepository.save(user);
                log.info("Payment succeeded for user {}", user.getEmail());
            }

            case "invoice.payment_failed" -> {
                var deserializer = event.getDataObjectDeserializer();
                Invoice invoice;
                try {
                    invoice = (Invoice) deserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.warn("Failed to deserialize invoice.payment_failed: {}", e.getMessage());
                    break;
                }
                log.warn("Payment failed for customer: {}", invoice.getCustomer());
            }

            default -> {
                // Unrecognised event type — return silently, do not crash
            }
        }
    }
}
