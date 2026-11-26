# Copyright © 2026 Christopher Snow
cmake_minimum_required(VERSION 3.20)

set(PICO_BOARD pico2 CACHE STRING "Raspberry Pi Pico 2")
set(PICO_PLATFORM rp2350-riscv CACHE STRING "RP2350 Hazard3")
if(NOT PICO_BOARD STREQUAL "pico2" OR NOT PICO_PLATFORM STREQUAL "rp2350-riscv")
    message(FATAL_ERROR "Build this lesson for pico2 with PICO_PLATFORM=rp2350-riscv.")
endif()

set(PICO_SDK_PATH "$ENV{PICO_SDK_PATH}" CACHE PATH "Path to the Raspberry Pi Pico SDK")
if(NOT EXISTS "${PICO_SDK_PATH}/external/pico_sdk_import.cmake")
    message(FATAL_ERROR "Point PICO_SDK_PATH to your Pico SDK checkout.")
endif()
include("${PICO_SDK_PATH}/external/pico_sdk_import.cmake")
project(trip_computer C CXX ASM)
pico_sdk_init()

if(NOT TARGET pico_stdio_usb)
    message(FATAL_ERROR "USB serial needs the TinyUSB submodule in the Pico SDK.")
endif()

add_executable(trip_computer trip.S)
target_link_libraries(trip_computer PRIVATE pico_stdlib)
pico_enable_stdio_usb(trip_computer 1)
pico_enable_stdio_uart(trip_computer 0)
pico_add_extra_outputs(trip_computer)
