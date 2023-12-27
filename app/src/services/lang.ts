export const lang = {
    kts: {
        equal: /(\b=\b)/g,
        quote: /((&#39;.*?&#39;)|(&#34;.*?&#34;)|(".*?(?<!\\)")|('.*?(?<!\\)')|`)/g,
        comm: /((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*))/g,
        logic: /(%=|%|\-|\+|\*|&amp;{1,2}|\|{1,2}|&lt;=|&gt;=|&lt;|&gt;|!={1,2}|={2,3})/g,
        number: /(?<![a-zA-Z1-9_])(\d+(\.\d+)?(e\d+)?)/g,
        kw: /(?<=^|\s*|)(?<![a-zA-Z0-9_])(as|break|class(?!\s*\=)|for|if|\!in|in|interface|\!is|is|null|object|package|return|super|this|throw|true|try|typealias|val|var|when|while|by|catch|constructor|set|setparam|where|actual|abstract|annotation|companion|const|crossinline|data|enum|expect|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|println|print|protected|public|reified|sealed|suspend|tailrec|vararg|field|it|delegate|dynamic|field|file|finally|get|import|init|param|property|receiver|continue|do|else|fun)(?=\b)/g,
        round: /(\(|\))/g,
        square: /(\[|\])/g,
        curl: /(\{|\})/g,
    },
    swift: {},
};
