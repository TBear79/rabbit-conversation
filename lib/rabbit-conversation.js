'use strict'

const amqplib = require('amqplib');
const uuid = require('node-uuid');
const rabbitChatter = require('rabbit-chatter');
const rabbitListener = require('rabbit-listener');


class RabbitConversation{
	constructor(options){

		if(!options)
			options = {};

		//rabbit-conversation
		this.replyToQueue = options.replyToQueue || uuid.v4();

		//set chatter and listener here
		this._chatter = rabbitChatter.rabbit(options);
		this._listener = rabbitListener.rabbit(options);
	}

	static rabbit(options){
		return new RabbitConversation(options);
	}

	converse(msg, properties, callback){
		const t = this;

		properties = properties || {};
		properties.appId = properties.appId || t.appId;
		properties.correlationId = properties.correlationId || uuid.v4();
		properties.timestamp = properties.timestamp || Date.now();

		t.chatAndListen(msg, properties, callback);
	}

	chatAndListen(msg, properties, callback){
		const t = this;
		
		
	}
}

module.exports= RabbitConversation;
