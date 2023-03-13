export class Async {
  async register(context: Context, message: Message, request: Request) {
    const response = await requestHandler.readRequest(context, link.getUrl(), 'initial poll read ' + logObject);
    const ackPayload = new Response(request.iprId, request.object, request.action);
    const ackResponse = new Message(message.thingId, message.messageId, message.serviceId, ackPayload);
    const publishResponse = await context.iotBusAdapter.publishMessage(ackResponse);
    if (response.isSuccess) {
      await publishObservedObject(context, message, request, response.content);
      pollReadAction = pollReadActionFactory.create(this, request, link, logObject);
      scheduleNextPoll(context, message, request);
    }
  }
}
