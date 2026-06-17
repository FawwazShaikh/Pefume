const fs = require('fs');
const path = require('path');
const readline = require('readline');
const logPath = 'C:\\\\Users\\\\rayan\\\\.gemini\\\\antigravity-ide\\\\brain\\\\fcce6318-6d95-44e4-9edd-74214235fe1d\\\\.system_generated\\\\logs\\\\transcript.jsonl';

function unstringify(val) {
  if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
    try {
      return JSON.parse(val);
    } catch(e) {}
  }
  return val;
}

async function replay() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch(e) { continue; }
    
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        let name = call.name || (call.function && call.function.name);
        if (name === 'write_to_file' || name === 'replace_file_content' || name === 'multi_replace_file_content') {
          let argsRaw = call.args || call.arguments || (call.function && call.function.arguments);
          let args = argsRaw;
          if (typeof argsRaw === 'string') {
            try { args = JSON.parse(argsRaw); } catch(e) {}
          }
          
          if (!args) continue;
          
          let parsedArgs = {};
          for (let k in args) {
            if (typeof args[k] === 'string') {
              parsedArgs[k] = unstringify(args[k]);
            } else if (Array.isArray(args[k])) {
              parsedArgs[k] = args[k].map(item => {
                if (typeof item === 'object') {
                  let parsedItem = {};
                  for (let jk in item) {
                    parsedItem[jk] = unstringify(item[jk]);
                  }
                  return parsedItem;
                }
                return unstringify(item);
              });
            } else {
              parsedArgs[k] = args[k];
            }
          }
          
          let target = parsedArgs.TargetFile;
          if (!target) continue;
          
          console.log('Replaying', name, 'on', target);

          try {
            if (name === 'write_to_file') {
              fs.writeFileSync(target, parsedArgs.CodeContent, 'utf8');
            } else if (name === 'replace_file_content') {
              if (!fs.existsSync(target)) continue;
              let content = fs.readFileSync(target, 'utf8');
              let lines = content.split('\n');
              let start = Number(parsedArgs.StartLine) - 1;
              let end = Number(parsedArgs.EndLine) - 1;
              
              let before = lines.slice(0, start).join('\n');
              let after = lines.slice(end + 1).join('\n');
              let newContent = before + (before ? '\n' : '') + parsedArgs.ReplacementContent + (after ? '\n' : '') + after;
              fs.writeFileSync(target, newContent, 'utf8');
            } else if (name === 'multi_replace_file_content') {
              if (!fs.existsSync(target)) continue;
              let content = fs.readFileSync(target, 'utf8');
              let lines = content.split('\n');
              
              let chunks = parsedArgs.ReplacementChunks || [];
              chunks.sort((a, b) => Number(b.StartLine) - Number(a.StartLine));
              
              for (let chunk of chunks) {
                let start = Number(chunk.StartLine) - 1;
                let end = Number(chunk.EndLine) - 1;
                let before = lines.slice(0, start).join('\n');
                let after = lines.slice(end + 1).join('\n');
                let newText = before + (before ? '\n' : '') + chunk.ReplacementContent + (after ? '\n' : '') + after;
                lines = newText.split('\n');
              }
              fs.writeFileSync(target, lines.join('\n'), 'utf8');
            }
          } catch(err) {
            console.error('Error on', name, target, err.message);
          }
        }
      }
    }
  }
  console.log('Done replaying.');
}

replay();
