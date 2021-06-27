import { DataTypes as _DataTypes } from "./util/DataVerify";
import {
  WrappedRequest as _WrappedRequest,
  WrappedResponse as _WrappedResponse,
  Wrapper as _Wrapper,
  RawWrapper as _RawWrapper,
} from "./util/ControllerUtil";
import serverStarter from "./util/ServerStarter";
import RestDecorator from "./util/RestDecorator";
import errorBuilder from "./util/ErrorBuilder";

// TYPES
export type WrappedRequest = _WrappedRequest;
export type WrappedResponse = _WrappedResponse;

// FUNCTIONS
export const DataTypes = _DataTypes;
export const Wrapper = _Wrapper;
export const RawWrapper = _RawWrapper;

export const Controller = RestDecorator.controller;
export const SetMiddleware = RestDecorator.middleware;
export const GetMapping = RestDecorator.mappings.get;
export const PostMapping = RestDecorator.mappings.post;
export const PutMapping = RestDecorator.mappings.put;
export const PatchMapping = RestDecorator.mappings.patch;
export const DeleteMapping = RestDecorator.mappings.delete;
export const HeadMapping = RestDecorator.mappings.head;
export const AllMapping = RestDecorator.mappings.all;
export const Mappings = RestDecorator.mappings;

export const NoErrorOnNull = RestDecorator.noErrorOnNull;
export const SetEndpointProperties = RestDecorator.setEndpointProperties;
export const ReturnRawData = RestDecorator.returnRawData;
export const UseCustomHandler = RestDecorator.useCustomHandler;
export const SetSuccessMessage = RestDecorator.setSuccessMessage;
export const QuickDecorator = RestDecorator;

export const ErrorBuilder = errorBuilder;

export const ServerStarter = serverStarter;

export default {
  serverStarter,
  RestDecorator,
  Wrapper,
  RawWrapper,
  DataTypes,
};
