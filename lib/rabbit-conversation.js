'use strict'

const amqplib = require('amqplib');
const uuid = require('node-uuid');
const rabbitChatter = require('rabbit-chatter');
const rabbitListener = require('rabbit-listener');


class RabbitConversation{
	constructor(options){

		if(!options)
			options = {};

		this.options = options;
	}

	static rabbit(options){
		return new RabbitConversation(options);
	}

	start(msg, properties, callback){
		const t = this;

		if(typeof properties == "function"){
			callback = properties;
			properties = null;
		}

		properties = properties || {};
		properties.replyTo = properties.replyToQueue || uuid.v4();
		properties.correlationId = properties.correlationId || uuid.v4();

		t.chatAndListen(msg, properties, callback);
	}

	chatAndListen(msg, properties, callback){
		const t = this;
		
		const chatter = rabbitChatter.rabbit(t.options);
		
		//always set the routingKey because we always want to listen on the replyTo-queue
		t.options.routingKey = properties.replyTo;
		const listener = rabbitListener.rabbit(t.options);

		listener.listen((replyMsg) => { 
			callback(replyMsg, properties.correlationId);
		})
		.then(() =>{
			chatter.chat(msg, properties);
		});
	}
}

module.exports= RabbitConversation;
