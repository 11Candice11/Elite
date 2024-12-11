import { BehaviorSubject, Observable } from 'rxjs';
import { getName } from './Common.js';

/**
* Keeps track of dispatchers per store (by name) in order to support
* both singleton- and instance-based stores.
*
* @ignore
*/
class Dispatcher {

	constructor() {
		this._stateChangedDispatchers = [];
		this._stateChangedObservables = [];

		this._stateChangedWithNameDispatchers = [];
		this._stateChangedWithNameObservables = [];

		this._stateChangedNoPayloadDispatchers = [];
		this._stateChangedNoPayloadObservables = [];

		this._stateChangedNoPayloadWithNameDispatchers = [];
		this._stateChangedNoPayloadWithNameObservables = [];

		this._statePropertiesChangedDispatchers = [];
		this._statePropertiesChangedObservables = [];

		this._statePropertiesChangedWithNameDispatchers = [];
		this._statePropertiesChangedWithNameObservables = [];
	}

	initAll(settings) {
		this.initStateChanged(settings);
		this.initStateChangedWithName(settings);
		this.initStateChangedNoPayload(settings);
		this.initStateChangedNoPayloadWithName(settings);
		this.initStatePropertiesChanged(settings);
		this.initStatePropertiesChangedWithName(settings);
	}

	initStateChanged(settings) {

		if (this._stateChangedDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._stateChangedDispatchers[getName(settings)] = dispatcher;
		this._stateChangedObservables[getName(settings)] = dispatcher.asObservable();
	}

	initStateChangedWithName(settings) {

		if (this._stateChangedWithNameDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._stateChangedWithNameDispatchers[getName(settings)] = dispatcher;
		this._stateChangedWithNameObservables[getName(settings)] = dispatcher.asObservable();
	}

	initStateChangedNoPayload(settings) {

		if (this._stateChangedNoPayloadDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._stateChangedNoPayloadDispatchers[getName(settings)] = dispatcher;
		this._stateChangedNoPayloadObservables[getName(settings)] = dispatcher.asObservable();
	}

	initStateChangedNoPayloadWithName(settings) {

		if (this._stateChangedNoPayloadWithNameDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._stateChangedNoPayloadWithNameDispatchers[getName(settings)] = dispatcher;
		this._stateChangedNoPayloadWithNameObservables[getName(settings)] = dispatcher.asObservable();
	}

	initStatePropertiesChanged(settings) {

		if (this._statePropertiesChangedDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._statePropertiesChangedDispatchers[getName(settings)] = dispatcher;
		this._statePropertiesChangedObservables[getName(settings)] = dispatcher.asObservable();
	}

	initStatePropertiesChangedWithName(settings) {

		if (this._statePropertiesChangedWithNameDispatchers[getName(settings)]) {
			return;
		}

		const dispatcher = new BehaviorSubject(null);
		this._statePropertiesChangedWithNameDispatchers[getName(settings)] = dispatcher;
		this._statePropertiesChangedWithNameObservables[getName(settings)] = dispatcher.asObservable();
	}

	/**
	 * Gets the state changed dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStateChangedDispatcher(settings) {
		return this._stateChangedDispatchers[getName(settings)];
	}

	/**
	 * Gets the state changed observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStateChangedObservable(settings) {
		return this._stateChangedObservables[getName(settings)];
	}

	/**
	 * Gets the state changed with name dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStateChangedWithNameDispatcher(settings) {
		return this._stateChangedWithNameDispatchers[getName(settings)];
	}

	/**
	 * Gets the state changed with name observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStateChangedWithNameObservable(settings) {
		return this._stateChangedWithNameObservables[getName(settings)];
	}

	/**
	 * Gets the state changed without payload dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStateChangedNoPayloadDispatcher(settings) {
		return this._stateChangedNoPayloadDispatchers[getName(settings)];
	}

	/**
	 * Gets the state changed without payload observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStateChangedNoPayloadObservable(settings) {
		return this._stateChangedNoPayloadObservables[getName(settings)];
	}

	/**
	 * Gets the state changed without payload with name dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStateChangedNoPayloadWithNameDispatcher(settings) {
		return this._stateChangedNoPayloadWithNameDispatchers[getName(settings)];
	}

	/**
	 * Gets the state changed without payload with name observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStateChangedNoPayloadWithNameObservable(settings) {
		return this._stateChangedNoPayloadWithNameObservables[getName(settings)];
	}

	/**
	 * Gets the state properties changed dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStatePropertiesChangedDispatcher(settings) {
		return this._statePropertiesChangedDispatchers[getName(settings)];
	}

	/**
	 * Gets the state properties changed observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStatePropertiesChangedObservable(settings) {
		return this._statePropertiesChangedObservables[getName(settings)];
	}

	/**
	 * Gets the state properties changed with name dispatcher instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {BehaviorSubject} Dispatcher instance.
	 */
	getStatePropertiesChangedWithNameDispatcher(settings) {
		return this._statePropertiesChangedWithNameDispatchers[getName(settings)];
	}

	/**
	 * Gets the state properties changed with name observable instance for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Observable} Observable instance.
	 */
	getStatePropertiesChangedWithNameObservable(settings) {
		return this._statePropertiesChangedWithNameObservables[getName(settings)];
	}
}

export default new Dispatcher();