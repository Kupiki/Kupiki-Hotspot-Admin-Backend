'use strict';

const execChildPromise = require('child-process-promise').exec;
const execChild = require('child_process').exec;

import config from '../config.json';

export function execPromise(command) {
  return execChildPromise('sudo /etc/kupiki/kupiki.sh ' + command, {
    timeout: config.httpSudoTimeout
  })
}

export function exec(command) {
  return execChild('sudo /etc/kupiki/kupiki.sh ' + command, {
    timeout: config.httpSudoTimeout
  })
}

let amqp_channel;

const eventEmitter = new (require('events').EventEmitter);

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

function initAMQP() {
  return require('amqplib').connect(config.rabbitMQ.url)
    .then(connection => connection.createChannel())
    .then(channel => {
      amqp_channel = channel
      return amqp_channel.assertQueue(config.rabbitMQ.kupiki_publish_queue, {exclusive: false, durable: false})
    })
    .then(() => {
      return amqp_channel.assertQueue(config.rabbitMQ.kupiki_reply_queue, {exclusive: false, durable: false})
    })
    .then(() => {
      return amqp_channel.consume(config.rabbitMQ.kupiki_reply_queue, (msg) => eventEmitter.emit(msg.properties.correlationId, msg), {noAck: true});
    })
}

function waitForCorrelationIdReply(correlationId) {
  return new Promise((resolve, reject) => {
    let errorMsg = {
      status: 'failed',
      message: 'Empty command result'
    };
    eventEmitter.on(correlationId, (msg) => {
      clearTimeout(rejectTimer);
      const messageContent = msg['content'].toString() || '{}';
      if (messageContent === '{}' || messageContent === '') {
        errorMsg['message'] = 'Empty command result';
        reject(errorMsg);
        return
      }
      resolve(messageContent)
    })
    const rejectTimer = setTimeout(() => {
      errorMsg['message'] = 'No response from the system';
      reject(errorMsg)
    }, config.rabbitMQ.timeout)
  })
}

export function sendCommandRequest(command) {
  return initAMQP().then(() => {
    const correlationId = generateUuid()
    amqp_channel.sendToQueue(config.rabbitMQ.kupiki_publish_queue, new Buffer(command), {
      correlationId: correlationId,
      replyTo: config.rabbitMQ.kupiki_reply_queue
    })
    return waitForCorrelationIdReply(correlationId);
  })
  .catch(() => {
    let errorMsg = {
      status: 'failed',
      message: 'Unable to connect to RabbitMQ'
    };
    throw(errorMsg);
  })
}