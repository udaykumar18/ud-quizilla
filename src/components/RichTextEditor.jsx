import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// RichTextEditor is an uncontrolled React component
const RichTextEditor = forwardRef(
  (
    {
      readOnly = false,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder,
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    // Helper function to check if content is empty
    const isContentEmpty = (html) => {
      if (!html || html.trim() === "") return true;

      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Get the text content without HTML tags
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      // Check if text content is empty (only whitespace)
      return textContent.trim() === "";
    };

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
        placeholder: placeholder || "Enter text...",
      });

      // Assign quill instance to ref
      if (ref) {
        ref.current = quill;
      }

      // Set default content
      if (defaultValueRef.current) {
        if (typeof defaultValueRef.current === "string") {
          quill.root.innerHTML = defaultValueRef.current;
        } else {
          quill.setContents(defaultValueRef.current);
        }
      }

      // Set up event listeners
      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        const content = quill.root.innerHTML;

        // Check if content is empty and send empty string if so
        const finalContent = isContentEmpty(content) ? "" : content;

        onTextChangeRef.current?.(finalContent, ...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        if (ref) {
          ref.current = null;
        }
        container.innerHTML = "";
      };
    }, [ref, placeholder]);

    return (
      <div
        ref={containerRef}
        style={{ minHeight: "200px" }}
        className="rich-text-editor"
      />
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
