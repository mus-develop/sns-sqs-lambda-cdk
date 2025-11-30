import { SQSEvent, SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  console.log('Received SQS event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      const snsMessage = JSON.parse(messageBody.Message);

      console.log('Successfully processed message:', record.messageId);
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; 
    }
  }
};
