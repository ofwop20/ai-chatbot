import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        // 检查是否是知识图谱的交互
        const isKnowledgeGraphInteraction = mutations.some(mutation => {
          const target = mutation.target as HTMLElement;
          return target.closest('.react-flow') !== null;
        });

        // 如果是知识图谱交互，不触发滚动
        if (isKnowledgeGraphInteraction) {
          return;
        }

        // 检查是否在底部附近
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        // 只有在底部附近或者是新消息时才滚动
        if (shouldScrollRef.current || isNearBottom) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      // 监听滚动事件
      const handleScroll = () => {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        shouldScrollRef.current = isNearBottom;
      };

      container.addEventListener('scroll', handleScroll);

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return [containerRef, endRef];
}
