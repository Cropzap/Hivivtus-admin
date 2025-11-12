import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx'; // Import Excel library
import * as FileSaver from 'file-saver'; // Import FileSaver

const API_URL = import.meta.env.VITE_API_URL;

// --- Inline SVG Icons (Kept as provided for consistency) ---
const FaTicketAlt = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M542.4 31.9c14.7-18.7 12.8-45.7-4.1-60.4s-45.7-12.8-60.4 4.1L25.6 376.5c-16.7 17.9-19.1 45.4-6.4 65.4l24.4 41.5 131.9-25.1c25.4-4.8 49.3-15.1 69.6-30.8l49.3-37c22.8-17.1 29.8-49.4 15.6-76.3l-13.7-25.1c-14.2-26.9-1.2-59.2 21.6-76.3l49.3-37c20.3-15.6 44.2-25.9 69.6-30.8L534 89.6c17.9-16.7 45.4-19.1 65.4-6.4l24.4 41.5c14.7-18.7 12.8-45.7-4.1-60.4s-45.7-12.8-60.4 4.1L542.4 31.9zM62.6 417.8c-10.9-11.6-28.7-13.1-41.6-3.8L2.4 430.2c-12.2 9.1-13.4 26.5-2.8 38.6l24.4 41.5c10.6 12.1 27.9 13.4 40.2 4.3L62.6 417.8z" /></svg>
);
const FaSearch = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40.8 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376.8C296.3 402.7 253.9 416 208 416c-114.9 0-208-93.1-208-208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
);
const FaSpinner = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48s21.49-48 48-48s48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zm208-160c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48s48-21.49 48-48zM320-96c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM96 160c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM416 416c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM160 416c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48z" /></svg>
);
const FaHourglassHalf = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M368 471.9c0 22.1-17.9 40.1-40 40.1H56c-22.1 0-40-18-40-40.1V424c0-22.1 17.9-40 40-40h272c22.1 0 40 17.9 40 40v47.9zM0 64C0 28.7 28.7 0 64 0h256c35.3 0 64 28.7 64 64v320H0V64zm320 160c0 44.1-35.9 80-80 80s-80-35.9-80-80h-32c0 61.9 50.1 112 112 112s112-50.1 112-112H320zm-112-128c-44.1 0-80 35.9-80 80h-32c0-61.9 50.1-112 112-112s112 50.1 112 112h-32c0-44.1-35.9-80-80-80z" /></svg>
);
const FaCheckCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM227.3 353.7l-114.2-114.2c-4.4-4.4-4.4-11.5 0-15.9l16.1-16.1c4.4-4.4 11.6-4.4 16.1 0l82.7 82.7 197.3-197.3c4.4-4.4 11.5-4.4 15.9 0l16.1 16.1c4.4 4.4 4.4 11.6 0 16.1L243.4 353.7c-4.4 4.4-11.6 4.4-16.1 0z" /></svg>
);
const FaTimes = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-12.5 32.8 0-45.3s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 209.3l105.4-105.3c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256l105.3 105.4z" /></svg>
);
const FaCommentDots = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M416 344V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v320c0 17.67 14.33 32 32 32h32v96l129.5-96H384c17.67 0 32-14.33 32-32zM219.2 181.7c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3zm121.2-121.2c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3zm-11.2-11.2c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3z" /></svg>
);
const FaUser = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 200.7c31.1-2.9 61-12.1 86.8-25.2 21-10.6 40.5-24.9 57.7-41.1 40.7-39.2 64.9-92.4 71.9-148.9-63.5-35.2-137.9-54.6-215.1-54.6-77.2 0-151.6 19.4-215.1 54.6 7 56.5 31.2 109.7 71.9 148.9 17.2 16.2 36.6 30.5 57.7 41.1 25.8 13.1 55.7 22.3 86.8 25.2z" /></svg>
);
const FaClipboardList = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M336 64h-88c-4.4-18.7-13.6-35.5-27.1-49.8C206.8 6.5 186.2-2.1 160 0c-26.2 2.1-46.8 10.7-60.9 29.5-13.5 14.3-22.7 31.1-27.1 49.8H48c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-160 40c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm128 0c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm-160 96c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm128 0c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48z" /></svg>
);
const FaHashtag = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M440.6 132.8L339.7 13.1C333.6 5.7 325.2 0 316.6 0H131.4c-9.5 0-17.9 5.7-24 13.1L24.8 132.8c-6.1 7.4-9.3 16.9-9.3 26.8v319.4c0 9.9 3.2 19.4 9.3 26.8l100.9 119.7c6.1 7.4 14.5 13.1 24 13.1h185.2c9.5 0 17.9-5.7 24-13.1l100.9-119.7c6.1-7.4 9.3-16.9 9.3-26.8V159.6c0-9.9-3.2-19.4-9.3-26.8zM304 464c0 8.8-7.2 16-16 16H160c-8.8 0-16-7.2-16-16V160c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16v304z" /></svg>
);
const FaFileAlt = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-144L248 0v136h136l-120-144z" /></svg>
);
const FaPaperclip = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M416 336H240c-26.5 0-48-21.5-48-48V168c0-26.5 21.5-48 48-48h80c26.5 0 48 21.5 48 48v120c0 17.7-14.3 32-32 32s-32-14.3-32-32V168c0-8.8-7.2-16-16-16s-16 7.2-16 16v120c0 17.7-14.3 32-32 32s-32-14.3-32-32V168c0-8.8-7.2-16-16-16s-16 7.2-16 16v120c0 26.5 21.5 48 48 48h80c26.5 0 48-21.5 48-48V168c0-8.8-7.2-16-16-16s-16 7.2-16 16V336z" /></svg>
);
const FaReply = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M416 160C416 71.63 344.4 0 256 0c-78.47 0-142 56.63-157.9 130.5-22.14 10.23-44.53 19.8-66.21 28.5-13.84 5.4-23.86 19.3-24.13 35.1-.26 15.8 8.87 30.6 22.84 37.1l19.45 9.1c5.22 2.4 11.2 3.6 17.1 3.6h256c88.37 0 160-71.63 160-160zM224 208v-40H80c-8.84 0-16 7.16-16 16s7.16 16 16 16h144z" /></svg>
);
const FaChevronLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M34.9 289.5l140.6 140.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L127.3 256 220.8 162.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L34.9 211.5c-12.5 12.5-12.5 32.8 0 45.3z" /></svg>
);
const FaChevronRight = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M285.1 211.5L144.5 70.9c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L192.7 256 99.2 349.9c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L285.1 289.5c12.5-12.5 12.5-32.8 0-45.3z" /></svg>
);
const FaAlertTriangle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.6 .1 40S475.5 480 463 480H49c-12.6 0-24.1-7.5-31.3-19.8s-7.2-27.6 .1-40l216-368C228.7 39.5 241.8 32 256 32zm0 128a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-32 128a32 32 0 1 0 64 0 32 32 0 1 0 -64 0z" /></svg>
);
const FaFileDownload = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM224 256c0-17.7-14.3-32-32-32s-32 14.3-32 32v128c0 17.7 14.3 32 32 32h64V32c0-17.7 14.3-32 32-32s32 14.3 32 32V128c0 53-43 96-96 96H128c-53 0-96-43-96-96V352z" /></svg>
);
const FaEnvelope = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M498.1 41.5c-2.3-3.6-5.8-6.6-10-8.9s-9-3.9-14.1-4.7L256 0 38.9 27.9c-5.1 .8-10.1 2.4-14.1 4.7s-7.7 5.3-10 8.9L1.9 64c-3.1 4.7-4.4 10.4-3.8 15.9s2.4 10.7 5.8 15L200.7 296c14.2 12.9 33.3 20 52.8 20s38.6-7.1 52.8-20L507.2 94.9c3.4-4.3 5.3-9.6 5.8-15s-1.1-11.2-3.8-15.9l-13-22.5zM256 312c-2.3 0-4.6-.3-6.9-.9-25.2-6.5-47.5-19.5-66.7-38.7L256 182.2l66.6 66.6c-19.2 19.2-41.5 32.2-66.7 38.7-2.3 .6-4.6 .9-6.9 .9zM0 128h512V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" /></svg>
);
const FaPhone = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M16 480c0 17.7 14.3 32 32 32s32-14.3 32-32V416h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V128c0-53-43-96-96-96h-96c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32 14.3 32 32v128c0 17.7-14.3 32-32 32h-64V192c0-17.7-14.3-32-32-32s-32 14.3-32 32v64h-64V192c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H16V480z" /></svg>
);
const FaMessageCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M496 160c-26.5 0-48 21.5-48 48v240c0 26.5 21.5 48 48 48s48-21.5 48-48V208c0-26.5-21.5-48-48-48zM32 160c26.5 0 48 21.5 48 48v240c0 26.5-21.5 48-48 48s-48-21.5-48-48V208c0-26.5 21.5-48 48-48zM160 0c-26.5 0-48 21.5-48 48v416c0 26.5 21.5 48 48 48h192c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H160zM160 48v416h192V48H160zM192 128h128c17.7 0 32-14.3 32-32s-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32zM192 224h128c17.7 0 32-14.3 32-32s-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32zM192 320h128c17.7 0 32-14.3 32-32s-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32z" /></svg>
);
const FaCircleUser = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M399 384.2c-14.3-26.3-48.4-44.2-96.6-56.7c-9.7-2.5-19.8-4.1-30-4.1H256c-10.2 0-20.3 1.6-30 4.1c-48.2 12.5-82.3 30.4-96.6 56.7C105.5 410.5 96 443.2 96 480c0 17.7 14.3 32 32 32h256c17.7 0 32-14.3 32-32c0-36.8-9.5-69.5-27-95.8zM256 0c-70.7 0-128 57.3-128 128s57.3 128 128 128s128-57.3 128-128S326.7 0 256 0z" /></svg>
);
const FaUserTie = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M416 160c-17.67 0-32-14.33-32-32 0-17.67 14.33-32 32-32s32 14.33 32 32-14.33 32-32 32zm0-64c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zm-144 0c-17.67 0-32-14.33-32-32 0-17.67 14.33-32 32-32s32 14.33 32 32-14.33 32-32 32zm0-64c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zM288 384c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm-45.7 200.7c31.1-2.9 61-12.1 86.8-25.2 21-10.6 40.5-24.9 57.7-41.1 40.7-39.2 64.9-92.4 71.9-148.9-63.5-35.2-137.9-54.6-215.1-54.6-77.2 0-151.6 19.4-215.1 54.6 7 56.5 31.2 109.7 71.9 148.9 17.2 16.2 36.6 30.5 57.7 41.1 25.8 13.1 55.7 22.3 86.8 25.2z" /></svg>
);
const FaTrash = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M432 32H312c-23.75 0-43.76-15.65-53.12-36.88-2.6-5.83-8.1-9.98-14.12-11.14l-12.7-2.3c-7.3-1.3-14.6 2.3-18.7 8.3L156.9 22.4c-4.1 6-2.5 13.4 3.7 17.5L254.1 79.5c6.2 4.1 14.3 3.1 19.4-2.4l7.1-7.8c3.2-3.5 8.1-4.7 12.7-3.2l12.5 3.2c4.6 1.1 9.2 3.6 12.8 7.3l12.8 12.8c3.7 3.7 6.2 8.2 7.3 12.8l3.2 12.5c1.5 4.6.3 9.5-3.2 12.7L420.7 154.5c6 4.1 13.4 2.5 17.5-3.7l23.1-34.6c4.1-6 2.5-13.4-3.7-17.5zM384 160H64C28.7 160 0 188.7 0 224v224c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z" /></svg>
);
const FaEye = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M288 144a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm0 240a96 96 0 1 0 0-192 96 96 0 1 0 0 192zm288-64c0 48.7-40 88.6-88.8 88.6-28.9 0-54.8-13.4-72.3-34.3-15.1 12.3-34.9 20.7-57.5 20.7-22.5 0-42.3-8.4-57.5-20.7-17.5 20.9-43.4 34.3-72.3 34.3-48.8 0-88.8-39.9-88.8-88.6 0-41.5 29.5-76.4 69.1-85.3-39.6-8.9-69.1-43.8-69.1-85.3 0-48.7 40-88.6 88.8-88.6 28.9 0 54.8 13.4 72.3 34.3 15.1-12.3 34.9-20.7 57.5-20.7 22.5 0 42.3 8.4 57.5 20.7 17.5-20.9 43.4-34.3 72.3-34.3 48.8 0 88.8 39.9 88.8 88.6 0 41.5-29.5 76.4-69.1 85.3 39.6 8.9 69.1 43.8 69.1 85.3z" /></svg>
);
const FaBuilding = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M432 0H16C7.163 0 0 7.163 0 16v480c0 8.837 7.163 16 16 16h416c8.837 0 16-7.163 16-16V16c0-8.837-7.163-16-16-16zM128 416H64V224h64v192zm128 0h-64V224h64v192zm128 0h-64V224h64v192zm0-256H64v-64h320v64z" /></svg>
);
const FaBriefcase = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M448 192V64c0-35.3-28.7-64-64-64H128C92.7 0 64 28.7 64 64v128H0v256c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V192h-64zM128 64h256v128H128V64zm320 384H32V256h448v192zM160 320h32v32h-32v-32zm64 0h32v32h-32v-32zm64 0h32v32h-32v-32zm64 0h32v32h-32v-32z" /></svg>
);
const FaCalendar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M384 96h-48V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H160V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H64C28.7 96 0 124.7 0 160v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64zM64 480c0 8.8-7.2 16-16 16s-16-7.2-16-16V160h352v320c0 8.8-7.2 16-16 16s-16-7.2-16-16V160H64v320zm144-80h-64c-8.8 0-16-7.2-16-16v-64c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16z" /></svg>
);
const FaMapPin = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M172.5 131.1C219.2 195.4 384 316.3 384 316.3V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48v-147.7s164.8-120.9 211.5-185.2c16.1-21.4 46.1-21.4 62.2 0z" /></svg>
);
const FaUsers = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor"><path d="M480 352a112 112 0 1 0 0-224 112 112 0 1 0 0 224zm-22.3 64c-12.7 5.1-26.2 8-40.7 8s-28-2.9-40.7-8c-20.7-8.3-41.9-19.6-61.1-34.9-39.2-30.8-63.5-75.1-70.1-123.6-6.6-48.5-4.4-97.1 6.6-145.6C265 67 296.8 32 336 32h16c39.2 0 71 35 71 78.4 11 48.5 13.2 97.1 6.6 145.6-6.6 48.5-30.9 92.8-70.1 123.6-19.2 15.3-40.4 26.6-61.1 34.9zM160 256A128 128 0 1 1 160 0a128 128 0 1 1 0 256zM512 256A128 128 0 1 1 512 0a128 128 0 1 1 0 256zM621.7 416c-12.7-5.1-26.2-8-40.7-8s-28 2.9-40.7 8c-20.7 8.3-41.9 19.6-61.1 34.9-39.2 30.8-63.5 75.1-70.1 123.6-6.6 48.5-4.4 97.1 6.6 145.6 11 48.5 42.8 83.5 82 83.5h16c39.2 0 71-35 71-78.4 11-48.5 13.2-97.1 6.6-145.6-6.6-48.5-30.9-92.8-70.1-123.6-19.2-15.3-40.4-26.6-61.1-34.9z" /></svg>
);
const FaChevronDown = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z" /></svg>
);

// --- CSS to hide scrollbars gracefully ---
const customStyles = `
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ message, onConfirm, onCancel, isProcessing }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.9, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 text-center"
    >
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
        <FaAlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
      <p className="text-gray-600 leading-relaxed">{message}</p>
      <div className="flex justify-center space-x-4">
        <motion.button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isProcessing ? (
            <FaSpinner className="h-5 w-5 animate-spin" />
          ) : (
            'Delete'
          )}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// --- View Details Modal Component ---
const ModalWrapper = ({ children, onClose, maxWidth = 'max-w-4xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900 bg-opacity-75 backdrop-blur-sm animate-fadeIn">
      <motion.div
          className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 md:p-8 relative`}
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
      >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
              <FaTimes className="h-5 w-5" />
          </button>
          {children}
      </motion.div>
  </div>
);

const CustomerDetailsModal = ({ customer, onClose }) => {
  if (!customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAddressString = (address) => {
    if (!address) return 'N/A';
    const { street, city, state, zip, country } = address;
    const parts = [street, city, state, zip, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-xl">
        <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-6 flex items-center">
            <FaUser className="h-7 w-7 mr-3 text-blue-500" /> Customer Details
        </h3>

        {/* Profile Picture & Full Name */}
        <div className="flex items-center space-x-4 mb-6">
            <img 
              src={customer.profilePicture || "https://placehold.co/100x100/E0E0E0/333333?text=User"} 
              alt={customer.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/E0E0E0/333333?text=User'; }}
            />
            <h4 className="text-2xl font-bold text-gray-900">
                {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
            </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Contact Information */}
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                <p className="text-gray-500 font-semibold text-sm">Primary Email</p>
                <p className="text-gray-800 text-lg flex items-center truncate">
                    <FaEnvelope className="h-5 w-5 mr-2 text-gray-400" />{customer.email}
                </p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                <p className="text-gray-500 font-semibold text-sm">Primary Phone</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaPhone className="h-5 w-5 mr-2 text-gray-400" />{customer.mobile}
                </p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                <p className="text-gray-500 font-semibold text-sm">Alternate Phone</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaPhone className="h-5 w-5 mr-2 text-gray-400" />{customer.alternatePhone || 'N/A'}
                </p>
            </div>

            {/* Personal & Professional Details */}
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-semibold text-sm">Date of Birth</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaCalendar className="h-5 w-5 mr-2 text-gray-400" />{formatDate(customer.dateOfBirth) || 'N/A'}
                </p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-semibold text-sm">Gender</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaUser className="h-5 w-5 mr-2 text-gray-400" />{customer.gender || 'N/A'}
                </p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-semibold text-sm">Occupation</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaBriefcase className="h-5 w-5 mr-2 text-gray-400" />{customer.occupation || 'N/A'}
                </p>
            </div>
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                <p className="text-gray-500 font-semibold text-sm">Company</p>
                <p className="text-gray-800 text-lg flex items-center">
                    <FaBuilding className="h-5 w-5 mr-2 text-gray-400" />{customer.company || 'N/A'}
                </p>
            </div>

            {/* Address */}
            <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                <p className="text-gray-500 font-semibold text-sm">Registered Address</p>
                <p className="text-gray-800 text-lg flex items-start">
                    <FaMapPin className="h-5 w-5 mr-2 text-gray-400 mt-1" />
                    {getAddressString(customer.address)}
                </p>
            </div>
        </div>
    </ModalWrapper>
  );
};


// --- Main Customer Component ---
export default function Customer() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = customStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use useCallback to memoize fetchCustomers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      if (!token || token.trim() === '') {
        throw new Error('Authorization token not found. Please log in again.');
      }

      const response = await fetch(`${API_URL}customers`, {
        headers: {
          'x-auth-token': token
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Invalid or expired token.');
        }
        throw new Error('Failed to fetch customers. Server responded with an error.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        (customer.name && customer.name.toLowerCase().includes(lowercasedTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(lowercasedTerm)) ||
        (customer.mobile && customer.mobile.includes(lowercasedTerm))
    );
  }, [customers, searchTerm]);

  const groupedCustomers = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Customers': filteredCustomers };
    }
    return filteredCustomers.reduce((acc, customer) => {
      const groupKey = customer[groupBy] || 'Unassigned';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(customer);
      return acc;
    }, {});
  }, [filteredCustomers, groupBy]);

  const handleToggleGroup = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleDeleteClick = (customerId) => {
    setCustomerToDelete(customerId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}customers/${customerToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer.');
      }

      setCustomers(customers.filter((customer) => customer._id !== customerToDelete));
      
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      // alert('Error deleting customer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleViewClick = (customer) => {
    setCustomerToView(customer);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setCustomerToView(null);
  };

  // --- EXCEL LOGIC ---
  const extractCustomerDataForExcel = (customer) => {
    const address = customer.address || {};
    return {
        "Customer ID": customer._id,
        "Name": customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A',
        "Email": customer.email || 'N/A',
        "Mobile": customer.mobile || 'N/A',
        "Alternate Phone": customer.alternatePhone || 'N/A',
        "Gender": customer.gender || 'N/A',
        "Date of Birth": customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A',
        "Occupation": customer.occupation || 'N/A',
        "Company": customer.company || 'N/A',
        "Address - Street/Apt": address.street || address.apartment || 'N/A',
        "Address - City": address.city || 'N/A',
        "Address - State": address.state || 'N/A',
        "Address - ZIP": address.zip || 'N/A',
        "Address - Country": address.country || 'N/A',
        "Account Created": new Date(customer.createdAt).toLocaleDateString(),
    };
  };

  const handleDownloadAllCustomers = () => {
    if (filteredCustomers.length === 0) {
        // Show an alert or toast message
        alert('No customers to export based on current filters.');
        return;
    }
    const data = filteredCustomers.map(extractCustomerDataForExcel);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { 'Customers': worksheet }, SheetNames: ['Customers'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(dataBlob, `Customer_Data_${new Date().toLocaleDateString()}.xlsx`);
  };
  // --- END EXCEL LOGIC ---


  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 md:p-8 relative">
        <div className="flex items-center space-x-4 mb-4">
          <FaUsers className="h-10 w-10 text-indigo-500" />
          <div>
            
            <p className="text-gray-500 text-lg">{customers.length} total customer records.</p>
          </div>
        </div>
      
        {/* --- Filters and Actions --- */}
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-xl mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-grow">
            <input
              type="text"
              name="search"
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-gray-600 font-medium whitespace-nowrap">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="flex-1 p-2.5 border border-gray-300 rounded-xl transition-colors"
              >
                <option value="none">None</option>
                <option value="occupation">Occupation</option>
                <option value="company">Company</option>
                <option value="gender">Gender</option>
              </select>
            </div>
          </div>
          <motion.button
            onClick={handleDownloadAllCustomers}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={filteredCustomers.length === 0}
          >
            <FaFileDownload className="h-5 w-5" />
            <span>Download All Data</span>
          </motion.button>
        </motion.div>

        {/* --- Customer Table/Grouped List Section --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {Object.keys(groupedCustomers).length > 0 && filteredCustomers.length > 0 ? (
            Object.keys(groupedCustomers).map((groupKey) => (
              <div key={groupKey} className="mb-0 last:mb-0 border-b border-gray-100">
                <div
                  onClick={() => handleToggleGroup(groupKey)}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-2xl cursor-pointer shadow-sm border-b border-gray-200"
                >
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    {collapsedGroups[groupKey] ? <FaChevronRight className="h-4 w-4 mr-2" /> : <FaChevronDown className="h-4 w-4 mr-2" />}
                    {groupKey} <span className="text-gray-500 ml-2 font-normal text-sm">({groupedCustomers[groupKey].length} customers)</span>
                  </h2>
                </div>
                {!collapsedGroups[groupKey] && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/5">Customer Name / ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4 hidden sm:table-cell">Contact / Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6 hidden md:table-cell">Professional</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/12 hidden lg:table-cell">Gender</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/12 hidden lg:table-cell">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <AnimatePresence>
                          {groupedCustomers[groupKey].map((customer, index) => (
                            <motion.tr
                              key={customer._id}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              variants={itemVariants}
                              className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FaCircleUser className="h-8 w-8 mr-3 text-indigo-400" />
                                  <div className="text-sm font-medium text-gray-900">
                                    <span className="font-bold">{customer.name || 'N/A'}</span>
                                    <p className="text-xs text-gray-500 truncate">ID: {customer._id.slice(-4)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                <div className="text-sm text-gray-700">
                                  <p className="flex items-center space-x-1"><FaEnvelope className="h-3 w-3 text-gray-400" /> <span className='truncate'>{customer.email}</span></p>
                                  <p className="flex items-center space-x-1"><FaPhone className="h-3 w-3 text-gray-400" /> <span>{customer.mobile}</span></p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <div className="text-sm text-gray-700">
                                  <p className="font-medium">{customer.company || '—'}</p>
                                  <p className="text-xs text-gray-500">{customer.occupation || '—'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                                {customer.gender || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <motion.button
                                    onClick={(e) => { e.stopPropagation(); handleViewClick(customer); }}
                                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                                    title="View Details"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaEye className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer._id); }}
                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                                    title="Delete Customer"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaTrash className="h-4 w-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 rounded-3xl border-2 border-dashed border-gray-300">
              <FaMessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl font-semibold">No customers found.</p>
              <p className="text-gray-500 mt-1">Adjust your search or grouping criteria to find customers.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            message="Are you sure you want to delete this customer record? This action cannot be undone."
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isProcessing={isDeleting}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showViewModal && <CustomerDetailsModal customer={customerToView} onClose={handleCloseViewModal} />}
      </AnimatePresence>
    </div>
  );
}