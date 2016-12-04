const fs      = require('fs');
const ref     = require('ref');
const util    = require('util');
const events  = require('events');
const Struct  = require('ref-struct');

/**
 * The C struct looks like this:
 *
 * struct input_event {
 *   struct timeval time;
 *   unsigned short type;
 *   unsigned short code;
 *   unsigned int value;
 * };
 */
const time_t = ref.types.int
const suseconds_t = ref.types.int
const timeval = Struct({
  tv_sec: time_t,
  tv_usec: suseconds_t
})
const input_event = Struct({
  time: timeval,
  type: ref.types.ushort,
  code: ref.types.ushort,
  value: ref.types.uint
})

/**
 * [EVENT_TYPES]
 * @type {Object}
 * @docs https://www.kernel.org/doc/Documentation/input/event-codes.txt
 * @docs https://www.kernel.org/doc/Documentation/input/joystick-api.txt
 * @source /include/uapi/linux/input-event-codes.h
 */
const EVENT_TYPES = {
  EV_SYN      : 0x00,
  EV_KEY      : 0x01, // [joystick] JS_EVENT_BUTTON
  EV_REL      : 0x02, // [joystick] JS_EVENT_AXIS
  EV_ABS      : 0x03,
  EV_MSC      : 0x04,
  EV_SW       : 0x05,
  EV_LED      : 0x11,
  EV_SND      : 0x12,
  EV_REP      : 0x14,
  EV_FF       : 0x15,
  EV_PWR      : 0x16,
  EV_FF_STATUS: 0x17,
  EV_MAX      : 0x1f,
  EV_INIT     : 0x80 // [joystick] JS_EVENT_INIT
};


/**
 * InputEvent
 */
function InputEvent(device){
  var self = this;
  events.EventEmitter.call(this);
  this.input_event = new input_event()
  this.device  = (device instanceof InputEvent) ? device.device : device;
  this.onRead = this.onRead.bind(this)
  fs.open(this.device, 'r', this.onOpen.bind(this));
}
/**
 * [inherits EventEmitter]
 */
util.inherits(InputEvent, events.EventEmitter);

InputEvent.prototype.onOpen = function(err, fd){
  if (err) return this.emit('error', err)
  this.fd = fd
  this.readLoop()
}

InputEvent.prototype.onRead = function(err, bytesRead){
  if (err) return this.emit('error', err)
  //console.log('bytes read:', bytesRead)
  if (bytesRead === 0) return this.emit('error', new Error('stream ended!'))
  this.emit('data', this.input_event)
  this.readLoop()
}

InputEvent.prototype.readLoop = function(){
  const buf = this.input_event.ref()
  fs.read(this.fd, buf, 0, input_event.size, null, this.onRead)
}
/**
 * [function close]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
InputEvent.prototype.close = function(callback){
  if (this.fd === null) {
    process.nextTick(callback)
  } else {
    fs.close(this.fd, callback)
  }
};
/**
 * [EVENT_TYPES]
 */
InputEvent.EVENT_TYPES = EVENT_TYPES;
/**
 * [exports InputEvent]
 * @type {[type]}
 */
module.exports = InputEvent;
