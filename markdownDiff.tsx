import parse, { domToReact, Element } from 'html-react-parser';
import classNames from 'classnames';
import * as Diff from 'diff';

export interface DiffResult {
  value: string; // 当前片段的文本内容
  added?: boolean; // 如果是新增的字符（只在新字符串中出现）
  removed?: boolean; // 如果是被删除的字符（只在旧字符串中出现）
  count?: number; // 可选：字符数量（等价于 value.length）
}

// 字符串转固定长度的base64
function toShortBase64Key(text, length = 16) {
  const encoded = btoa(unescape(encodeURIComponent(text)));
  return encoded.replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
}

export const diffResultMap = (diff: DiffResult[]) => {
  console.log('🚀 log - diffResultMap - diff:', diff);
  const content = diff
    .map(part => {
      // 忽略回车造成的影响
      if (part.added) {
        return part.value
          .split('\n')
          .map(value => (value === '' ? value : `<ins>${value}</ins>`))
          .join('\n');
      } else if (part.removed) {
        return part.value
          .split('\n')
          .map(value => (value === '' ? value : `<del>${value}</del>`))
          .join('\n');
      } else {
        return part.value;
      }
    })
    .join('');

  return content
    .split('\n')
    .map((line, index) => {
      console.log('🚀 cjc - returncontent.split - line:', line);
      const hSharpMatch = line.match(/^(#{2,6})\s*(.+)$/); // 匹配markdown中的标题内容
      const key = toShortBase64Key(`${line}_${index}`);
      if (hSharpMatch) {
        return {
          key,
          type: 'heading',
          level: hSharpMatch[1].length,
          html: hSharpMatch[2],
        };
      }

      return {
        key,
        type: 'paragraph',
        html: line,
      };
    })
    .map((line, index) => {
      const content = parse(line.html, {
        replace: domNode => {
          if (domNode instanceof Element) {
            if (domNode.name === 'ins') {
              return (
                <span
                  key={`${index}-ins`}
                  style={{ backgroundColor: '#d4fcdc', color: 'green' }}
                >
                  {domToReact(domNode.children as any)}
                </span>
              );
            }
            if (domNode.name === 'del') {
              return (
                <span
                  key={`${index}-del`}
                  style={{ backgroundColor: '#ffecec', color: 'red' }}
                >
                  {domToReact(domNode.children as any)}
                </span>
              );
            }
          }
          return undefined;
        },
      });

      return (
        <div
          key={line.key}
          className={classNames(line.type, {
            [`heading-${line.level}`]: line.type === 'heading',
          })}
        >
          {content}
        </div>
      );
    });
};

const oldMd = `
## 标题一
这是一段文本

### 小标题
更多内容
`;

const newMd = `
## 新标题一
这真是文本

### 小标题
更多新内容
`;

diffResultMap(Diff.diffChars(oldMd, newMd));
