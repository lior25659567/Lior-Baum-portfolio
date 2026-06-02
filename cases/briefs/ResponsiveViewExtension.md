ResponsiveView — Responsive Testing Extension for VS Code and Cursor

Project overview

ResponsiveView is a VS Code and Cursor extension I created for students in my vibe coding course, to help them test their web applications across different screen sizes directly inside their coding environment.

The tool allows users to load any localhost URL inside a realistic device frame, including phones, tablets, laptops, desktops, and ultrawide monitors. Instead of switching between browser windows, DevTools, and different preview sizes, students can quickly check how their application behaves across multiple real viewport sizes from one focused panel.

The problem

During the course, many students were building web applications but did not always test them properly across different breakpoints. In many cases, the design looked good on their own screen, but broke on mobile, tablet, or larger desktop sizes.

The main issues were:

Students relied too much on one screen size.

Testing responsive behavior in DevTools felt technical and not always intuitive.

Switching between browser windows interrupted the coding flow.

Students needed a faster way to understand how their interface behaves on real devices.

The goal

The goal was to create a simple and accessible tool that helps students preview and test their applications on different screen sizes without leaving VS Code or Cursor.

I wanted the tool to feel practical, visual, and easy to use, especially for students who are still learning how responsive design works.

Target users

The main users were students in my vibe coding course who are building applications with tools like React, Vite, or other localhost-based development environments.

These students need to quickly test their UI while coding, understand layout issues, and improve their responsive design decisions before presenting or shipping their projects.

The solution

ResponsiveView opens a preview panel directly inside VS Code or Cursor. The user can enter a localhost URL, choose a device type, and instantly see the application inside a realistic device frame.

The extension includes phones, tablets, laptops, desktops, ultrawide screens, custom dimensions, and common breakpoint presets. It also remembers the user’s last URL, selected device, orientation, and theme, so the experience feels continuous between sessions.

Key features

ResponsiveView includes 52 built-in devices across phones, tablets, laptops, desktops, and ultrawide monitors.

Users can switch between portrait and landscape orientation with one click.

The preview automatically scales to fit the available panel size, so even large screens can be previewed without unnecessary scrolling.

Custom dimensions allow students to test specific viewport sizes.

Breakpoint presets make it easier to test common CSS, Tailwind, and Bootstrap screen sizes.

The interface supports dark and light themes to match the coding environment.

Realistic device frames are created with CSS, including details like notches, Dynamic Island, laptop hinges, and monitor stands.

The extension remembers the last used state, including URL, device, orientation, and theme.

Accessibility was also considered, with readable contrast, aria labels, visible focus states, and reduced-motion support.

Design approach

The design direction was focused on clarity, speed, and staying close to the developer workflow.

Since the tool lives inside VS Code and Cursor, I designed it to feel like a natural part of the coding environment rather than a separate product. The interface is minimal and functional, with quick access to the most important actions: URL input, device selection, orientation switch, refresh, theme toggle, and custom size controls.

I also wanted the device preview to feel visual and understandable, so students could immediately connect the screen size they are testing with a real device type.

Why it matters

Responsive design is often understood only after something breaks. This tool helps students catch those issues earlier, while they are still building.

By making responsive testing more visual and accessible, ResponsiveView supports better design awareness, cleaner implementation, and stronger final projects.

Reflection

This project helped me think about the connection between design education and development tools. The goal was not only to build a technical extension, but to create a tool that supports better learning habits.

Instead of asking students to remember to test every breakpoint manually, ResponsiveView makes responsive testing part of the natural coding workflow. It turns a technical check into a more visual and approachable design practice.
