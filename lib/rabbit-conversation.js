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
		
		//set chatter and listener here
		const chatter = rabbitChatter.rabbit(t.options);
		
		t.options.routingKey = properties.replyTo;
		const listener = rabbitListener.rabbit(t.options);

		//Start listening before chatting
		listener.listen((replyMsg) => { 
			console.log('HEARD IT 1 ' + replyMsg.properties.replyTo + ' - ' + properties.replyTo);
			console.log('HEARD IT 2 ' + replyMsg.properties.correlationId + ' - ' + properties.correlationId);
			console.log('HEARD IT 3 ' + replyMsg.properties.appId + ' - ' + properties.appId);
			if(replyMsg.properties.appId != properties.appId && replyMsg.properties.replyTo == properties.replyTo && replyMsg.properties.correlationId == properties.correlationId) {
				callback(replyMsg);
			}
		})
		.then(() =>{
			console.log('CHATTED');
			chatter.chat(msg, properties);
		});
	}
}

module.exports= RabbitConversation;
