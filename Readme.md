# rplan-logger

[![Build Status](https://travis-ci.org/actano/rplan-logger.svg?branch=master)](https://travis-ci.org/actano/rplan-logger)
[![Greenkeeper badge](https://badges.greenkeeper.io/actano/rplan-logger.svg)](https://greenkeeper.io/)

This is a reusable logger module for RPLAN. It's based on [`bunyan`](https://www.npmjs.com/package/bunyan).

## Configuration

The logger can be configured via the `@rplan/config` module which should be made available as a peer
dependency to this logger module. The following config keys are recognized:

* `LOG_LEVEL` (string) - Defines the log level upto which log entries will be written. See the [bunyan docs](https://github.com/trentm/node-bunyan#levels)
for more information on available log levels.
* `logging:human_readable` (boolean) - A flag that indicates whether log entries should be formatted
for human readability. Otherwise log entries will be pure JSON.
* `logging:root_logger_name` (string) - The name of the root logger. This will be the common
namespace prefix for all log entries which are created with this logger.

## API

### Default export

`createLogger(namespace)` - Creates a new logger instance with the given namespace.

### Logger

The logger is derived from the `bunyan` logger. See the [docs](https://github.com/trentm/node-bunyan#log-method-api)
for the logging API.

Additional methods:

* `withNamespace(namespace)` - Creates a child logger where the given `namespace` is appended to the
namespace of the parent logger.

## Example

```javascript
import createLogger from '@rplan/logger'

const logger = createLogger('my-feature')
logger.info('My feature is started')

const subLogger = logger.withNamespace('my-sub-feature')
logger.debug('The sub logger is working')
``` 
