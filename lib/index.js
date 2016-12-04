const fs      = require('fs');
const ref     = require('ref');
const util    = require('util');
const events  = require('events');
const Buffers = require('buffers');
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
console.log(input_event.size)

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
function InputEvent(device, options){
  var self = this;
  this.buffers = Buffers()
  events.EventEmitter.call(this);
  this.device  = (device instanceof InputEvent) ? device.device : device;
  this.options = options || { flags: 'r', encoding: null };
  this.fd = fs.createReadStream(this.device, this.options);
  this.fd.on('data', function(data){
    self.buffers.push(data)
    //self.emit('raw', data);
    self.parse()
    //self.emit('data', ev, data)
  });
}
/**
 * [inherits EventEmitter]
 */
util.inherits(InputEvent, events.EventEmitter);
/**
 * [function parse]
 */
InputEvent.prototype.parse = function(){
  const buf = this.buffers.toBuffer()
  let startOffset = 0
  //console.error('parsing:', buf)
  while (startOffset + input_event.size <= buf.length) {
    const ev = input_event.get(buf, startOffset)
    //console.error(ev)
    this.emit('data', ev, buf)
    startOffset += input_event.size
  }
  //console.log('leftover?', buf.length - startOffset)
};
/**
 * [function close]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
InputEvent.prototype.close = function(callback){
  this.fd.close(callback);
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
