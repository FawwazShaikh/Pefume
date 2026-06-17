const fs = require('fs');
const readline = require('readline');
const path = 'C:\\\\Users\\\\rayan\\\\.gemini\\\\antigravity-ide\\\\brain\\\\fcce6318-6d95-44e4-9edd-74214235fe1d\\\\.system_generated\\\\logs\\\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch(e) { continue; }
    
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        let name = call.name || (call.function && call.function.name);
        if (!name) continue;
        
        let argsStr = call.arguments || (call.function && call.function.arguments);
        let args;
        try {
          args = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
        } catch (e) { continue; }
        if (!args) continue;
        
        let target = args.TargetFile;
        if (!target) continue;

        console.log('Replaying', name, 'on', target);

        if (name === 'write_to_file') {
          fs.writeFileSync(target, args.CodeContent, 'utf8');
        } else if (name === 'replace_file_content') {
          if (!fs.existsSync(target)) continue;
          let content = fs.readFileSync(target, 'utf8');
          let lines = content.split('\n');
          let start = args.StartLine - 1;
          let end = args.EndLine - 1;
          
          let before = lines.slice(0, start).join('\n');
          let after = lines.slice(end + 1).join('\n');
          let newContent = before + (before ? '\n' : '') + args.ReplacementContent + (after ? '\n' : '') + after;
          fs.writeFileSync(target, newContent, 'utf8');
        } else if (name === 'multi_replace_file_content') {
          if (!fs.existsSync(target)) continue;
          let content = fs.readFileSync(target, 'utf8');
          let lines = content.split('\n');
          
          // Apply chunks in reverse order to not mess up line numbers
          let chunks = args.ReplacementChunks || [];
          chunks.sort((a, b) => b.StartLine - a.StartLine);
          
          for (let chunk of chunks) {
            let start = chunk.StartLine - 1;
            let end = chunk.EndLine - 1;
            let before = lines.slice(0, start).join('\n');
            let after = lines.slice(end + 1).join('\n');
            let newText = before + (before ? '\n' : '') + chunk.ReplacementContent + (after ? '\n' : '') + after;
            lines = newText.split('\n');
          }
          fs.writeFileSync(target, lines.join('\n'), 'utf8');
        }
      }
    }
  }
  console.log('Done replaying.');
}
processLineByLine();
