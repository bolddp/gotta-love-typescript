package async;

import java.util.concurrent.CompletableFuture;

public class Async {
  private CompletableFuture<Void> register(final Context context, final Message message, final Request request) {

    // Execute initial read request
    return requestHandler
        .readRequestAsync(context, link.getUrl(), "initial poll read " + logObject)
        .thenComposeAsync(response -> {
          // Setup the response to the ObservableRequest and publish it to MQTT
          final Response ackPayload = new Response(request.getIprId(), request.getObject(),
              request.getAction());
          final Message ackResponse = new Message(message.getThingId(),
              message.getMessageId(), message.getServiceId(),
              ackPayload);

          return context.getAdapter().publishMessageAsync(ackResponse).thenComposeAsync(res -> {
            if (response.isSuccess()) {
              return publishObservedObjectAsync(context, message, request, response.getContent())
                  .thenRunAsync(() -> {
                    // Set up polling components
                    pollReadAction = pollReadActionFactory.create(this, request, link, logObject);
                    scheduleNextPoll(context, message, request);
                  }, executor);
            }
            return CompletableFuture.completedFuture(null);
          });
        }, executor);
  }

}
