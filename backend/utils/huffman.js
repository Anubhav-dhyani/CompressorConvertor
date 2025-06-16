class Node {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildFrequencyMap(data) {
  const freq = {};
  for (const byte of data) {
    const ch = byte.toString();
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

function buildHuffmanTree(freqMap) {
  const nodes = Object.entries(freqMap).map(([char, freq]) => new Node(char, freq));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push(new Node(null, left.freq + right.freq, left, right));
  }
  return nodes[0];
}

function buildCodes(node, code = '', codes = {}) {
  if (!node.left && !node.right) {
    codes[node.char] = code;
    return codes;
  }
  if (node.left) buildCodes(node.left, code + '0', codes);
  if (node.right) buildCodes(node.right, code + '1', codes);
  return codes;
}

function serializeTree(node) {
  if (!node.left && !node.right) return { char: node.char };
  return { left: serializeTree(node.left), right: serializeTree(node.right) };
}

function deserializeTree(obj) {
  if (obj.char !== undefined) return new Node(obj.char);
  return new Node(null, null, deserializeTree(obj.left), deserializeTree(obj.right));
}

function toBuffer(encoded) {
  const padding = (8 - (encoded.length % 8)) % 8;
  const paddedEncoded = encoded + '0'.repeat(padding);
  const buffer = Buffer.alloc(paddedEncoded.length / 8);
  for (let i = 0; i < paddedEncoded.length; i += 8) {
    buffer[i / 8] = parseInt(paddedEncoded.slice(i, i + 8), 2);
  }
  return { buffer, padding };
}

function fromBuffer(buffer, padding) {
  let binary = '';
  for (const byte of buffer) {
    binary += byte.toString(2).padStart(8, '0');
  }
  return binary.slice(0, binary.length - padding);
}

function compressBinary(buffer) {
  const freqMap = buildFrequencyMap(buffer);
  const tree = buildHuffmanTree(freqMap);
  const codes = buildCodes(tree);

  const encoded = Array.from(buffer).map(byte => codes[byte.toString()]).join('');
  const { buffer: encodedBuffer, padding } = toBuffer(encoded);

  return { buffer: encodedBuffer, tree: serializeTree(tree), padding };
}

function decompressBinary(buffer, treeObj, padding) {
  const encoded = fromBuffer(buffer, padding);
  const tree = deserializeTree(treeObj);

  let result = [];
  let node = tree;

  for (let bit of encoded) {
    node = bit === '0' ? node.left : node.right;
    if (!node.left && !node.right) {
      result.push(parseInt(node.char));
      node = tree;
    }
  }

  return Buffer.from(result);
}

module.exports = {
  compressBinary,
  decompressBinary,
};
