//REQUIREMENTS:
//npm install in test-dir
//RabbitMq installed locally
//Mocha

'use strict'

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const amqplib = require('amqplib');

const rabbitConversation = require('../lib/rabbit-conversation.js');

describe('RabbitMq', () => {
	describe('Test if A reply is returned', function() {
		this.timeout(30000);

		const testAppId1 = 'TESTAPPIDALL';

		const options = { 
			appId: testAppId1,
			protocol: 'amqp',
			username: 'guest',
			password: 'guest',
			host: 'localhost',
			port: 5672,
			silent: true,
			host: 'localhost',
			exchangeName: 'TEST',
			exchangeType: 'topic',
			durable: false
		}

		
		var rabbit1 = rabbitConversation.rabbit(options);
		
		before(function () { 
		});
		after(function () { 
		});

		it('should set up a call via rabbit-conversation, start a listen-server and return a reply. ',  (done) => {
			let connection; 
			let connectionCloseTimerId;
			const testContent = 'TESTING 123';
			const testCorrelationId = 'CORRELATIONIDTEST';
			
			let msgCount = 0;

			setTimeout(() => { 
				//Start conversation here and do asserts on the reply

				rabbit1.start(testContent, (msg) => { 
					expect(msg.content.toString()).to.equal("DIDYOUSAY: " + testContent + "???");
					done();
				});
			 }, 50);

			 //Set up a server chat 
			return amqplib
				 .connect(options.protocol + '://' + options.host)
				.then((conn) => { connection = conn; return conn.createChannel(); })
				.then((channel) => {
					return channel.assertExchange(options.exchangeName, options.exchangeType, {durable: options.durable})
						.then((ok) => {
							return channel.assertQueue('', {exclusive: true})
					    				.then((q) => {
					    					channel.bindQueue(q.queue, options.exchangeName, '');

					    					return channel.consume(q.queue, (msg) => {
					    						channel.sendToQueue(msg.properties.replyTo,
												new Buffer("DIDYOUSAY: " + msg.content.toString() + "???"),
												{correlationId: msg.properties.correlationId});
										    }, {noAck: true});
					    				})

					  	});
				})
				.catch((ex) => { throw ex; });
		});
	});
});

