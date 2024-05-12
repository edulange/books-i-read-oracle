function existsOrError(value, msg) {
    if (!value) throw msg
    if (Array.isArray(value) && value.length === 0) throw msg
    if (typeof value === 'string' && !value.trim()) throw msg //value é uma string e não tem espaço em branco?
}

module.exports = { existsOrError }